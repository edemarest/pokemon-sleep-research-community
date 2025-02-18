import { db } from "./firebaseConfig";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  orderBy,
} from "firebase/firestore";
import { getAuth, deleteUser } from "firebase/auth"; // ✅ Correct Firebase Auth imports
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  getMetadata,
} from "firebase/storage";

const storage = getStorage();
const auth = getAuth();
const DEFAULT_PFP = "/images/default-avatar.png";

/** 🔹 Check if a trainer name or friend code already exists */
export const checkUserExists = async (trainerName, friendCode) => {
  try {
    console.log("🔍 Checking if user exists:", { trainerName, friendCode });

    const usersRef = collection(db, "users");
    const q1 = query(usersRef, where("trainerName", "==", trainerName));
    const q2 = query(usersRef, where("friendCode", "==", friendCode));

    console.log("📡 Sending Firestore queries...");
    const [trainerNameCheck, friendCodeCheck] = await Promise.all([
      getDocs(q1),
      getDocs(q2),
    ]);

    console.log(
      "📜 Trainer Name Check:",
      trainerNameCheck.docs.map((doc) => doc.data()),
    );
    console.log(
      "📜 Friend Code Check:",
      friendCodeCheck.docs.map((doc) => doc.data()),
    );

    return {
      trainerNameExists: !trainerNameCheck.empty,
      friendCodeExists: !friendCodeCheck.empty,
    };
  } catch (error) {
    console.error("🔥 Error checking user existence:", error);
    return { trainerNameExists: false, friendCodeExists: false };
  }
};

/** 🔹 Create a new user in Firestore */
/** 🔹 Create a new user in Firestore */
export const createUserProfile = async (
  uid,
  email,
  trainerName,
  friendCode,
  friendCodeVisibility,
) => {
  try {
    console.log("📝 Creating user profile:", {
      uid,
      email,
      trainerName,
      friendCode,
      friendCodeVisibility,
    });
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, {
      uid,
      email,
      trainerName,
      friendCode,
      friendCodeVisibility,
      profilePicture: DEFAULT_PFP,
      createdAt: new Date(),
    });

    console.log(
      "✅ User profile successfully created in Firestore with default profile picture!",
    );
    return true;
  } catch (error) {
    console.error("🔥 Error creating user profile:", error);
    return false;
  }
};

export const getUserProfile = async (userId, currentUser = null) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.warn(`⚠️ No profile found for userId: ${userId}`);
      return {
        trainerName: "Unknown Trainer", // ✅ Ensures trainer name is always valid
        profilePicture: "/images/default-avatar.png", // ✅ Default profile picture
      };
    }

    const userData = userSnap.data();
    console.log(
      `👤 Fetching Profile | userId: ${userId} | Visibility: ${userData.friendCodeVisibility}`,
    );

    // ✅ Always return trainer name and profile picture
    const profile = {
      trainerName: userData.trainerName || "Unknown Trainer",
      profilePicture: userData.profilePicture || "/images/default-avatar.png",
    };

    // ✅ Friend Code Visibility Logic (unchanged)
    if (
      userData.friendCodeVisibility === "everyone" ||
      (userData.friendCodeVisibility === "registered" && currentUser) ||
      (currentUser && currentUser.uid === userId) // User can always see their own
    ) {
      profile.friendCode = userData.friendCode;
    }

    return profile;
  } catch (error) {
    console.error("🔥 Error fetching user profile:", error);
    return {
      trainerName: "Unknown Trainer", // ✅ Prevents crashes
      profilePicture: "/images/default-avatar.png",
    };
  }
};

/** 🔹 Update user profile */
export const updateUserProfile = async (uid, updatedData) => {
  try {
    console.log(
      "✏️ Updating user profile for UID:",
      uid,
      "with data:",
      updatedData,
    );

    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, updatedData);

    console.log("✅ User profile successfully updated!");
    return true;
  } catch (error) {
    console.error("🔥 Error updating user profile:", error);
    return false;
  }
};
export const deleteUserProfile = async (uid) => {
  try {
    // 🔹 Re-authenticate user before deletion
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user found.");

    const password = prompt(
      "Please enter your password to confirm account deletion:",
    );
    if (!password) throw new Error("Password required for re-authentication.");

    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);

    // 🔹 Delete profile picture first (if it exists)
    await deleteProfilePicture(uid);

    // 🔹 Delete user profile from Firestore
    await deleteDoc(doc(db, "users", uid));

    // 🔹 Delete the user from Firebase Authentication
    await deleteUser(user);

    console.log("✅ User profile and account successfully deleted.");
  } catch (error) {
    console.error("🔥 Error deleting user profile:", error);
    throw new Error("Failed to delete profile. " + error.message);
  }
};

/** 🔹 Upload Profile Picture */
export const uploadProfilePicture = async (uid, file) => {
  try {
    if (!file || !file.name) {
      throw new Error("Invalid file. Please select a valid image.");
    }

    console.log(
      "📸 Uploading new profile picture for UID:",
      uid,
      "File:",
      file,
    );

    // ✅ Ensure the file is correctly passed to Firebase Storage
    const storageRef = ref(storage, `profilePictures/${uid}/profile.jpg`);

    // ✅ Use uploadBytes instead of expecting a 'path' property
    const snapshot = await uploadBytes(storageRef, file);

    // ✅ Get the download URL for the uploaded image
    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log("✅ Profile picture uploaded successfully! URL:", downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("🔥 Error uploading profile picture:", error);
    return null;
  }
};

/** 🔹 Delete profile picture and reset to default */
export const deleteProfilePicture = async (uid) => {
  try {
    console.log("🗑️ Attempting to delete profile picture for UID:", uid);

    const storageRef = ref(storage, `profilePictures/${uid}/profile.jpg`);

    // ✅ Check if the profile picture exists before deleting
    try {
      await getMetadata(storageRef); // Will throw an error if file does not exist
    } catch (error) {
      console.warn("⚠️ Profile picture does not exist. Skipping deletion.");
      return;
    }

    await deleteObject(storageRef);
    console.log("✅ Profile picture deleted successfully.");
  } catch (error) {
    console.error("🔥 Error deleting profile picture:", error);
  }
};

/** 🔹 Fetch Public Trainer Codes */
export const getPublicTrainerCodes = async (user) => {
  try {
    let trainerQuery;

    if (user) {
      // If logged in, fetch trainers with "registered" or "everyone" visibility
      trainerQuery = query(
        collection(db, "users"),
        where("friendCodeVisibility", "in", ["registered", "everyone"]),
      );
    } else {
      // If NOT logged in, only fetch trainers with "everyone" visibility
      trainerQuery = query(
        collection(db, "users"),
        where("friendCodeVisibility", "==", "everyone"),
      );
    }

    const trainerSnapshot = await getDocs(trainerQuery);
    return trainerSnapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error("🔥 Error fetching public trainer codes:", error);
    return [];
  }
};

export const getEntries = async (limit) => {
  try {
    const entriesRef = collection(db, "entries");
    const q = query(entriesRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    let entries = [];
    querySnapshot.forEach((doc) => {
      const entryData = doc.data();
      console.log("🔥 Fetched Entry Data:", entryData); // ✅ Debugging output
      entries.push({ id: doc.id, ...entryData });
    });

    return entries.slice(0, limit);
  } catch (error) {
    console.error("🔥 Error fetching entries:", error);
    return [];
  }
};

export const getAllEntries = async (filterTag = null) => {
  try {
    const entriesRef = collection(db, "entries");
    let q = query(entriesRef, orderBy("createdAt", "desc"));

    if (filterTag) {
      q = query(entriesRef, where("tags", "array-contains", filterTag));
    }

    const querySnapshot = await getDocs(q);
    let entries = [];
    querySnapshot.forEach((doc) => {
      entries.push({ id: doc.id, ...doc.data() });
    });

    return entries;
  } catch (error) {
    console.error("🔥 Error fetching entries:", error);
    return [];
  }
};

export const saveEntry = async (userId, trainerName, text, imageUrl, tags) => {
  try {
    const entryData = {
      authorId: userId,
      trainerName: trainerName,
      text: text,
      imageUrl: imageUrl || null, // Optional
      tags: tags.length ? tags : ["General"], // Default to "General"
      likes: [], // Empty like list
      createdAt: new Date(),
    };

    const docRef = await addDoc(collection(db, "entries"), entryData);
    console.log("✅ Entry successfully created:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("🔥 Error saving entry:", error);
    return null;
  }
};

export const uploadEntryImage = async (userId, file) => {
  try {
    if (!file) throw new Error("Invalid file.");

    console.log("📸 Uploading image for user:", userId);

    const storageRef = ref(getStorage(), `entryImages/${userId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    console.log("✅ Image uploaded successfully! URL:", downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("🔥 Error uploading entry image:", error);
    return null;
  }
};

export const toggleLike = async (entryId, userId) => {
  try {
    const entryRef = doc(db, "entries", entryId);
    const entrySnapshot = await getDoc(entryRef);

    if (!entrySnapshot.exists()) {
      console.error("⚠️ Entry does not exist.");
      return false;
    }

    const entryData = entrySnapshot.data();
    const isLiked = entryData.likes.includes(userId);

    await updateDoc(entryRef, {
      likes: isLiked
        ? arrayRemove(userId) // Remove like
        : arrayUnion(userId), // Add like
    });

    console.log(isLiked ? "👍 Like removed" : "❤️ Like added");
    return true;
  } catch (error) {
    console.error("🔥 Error toggling like:", error);
    return false;
  }
};

export const getComments = async (entryId) => {
  try {
    const commentsRef = collection(db, `entries/${entryId}/comments`);
    const q = query(commentsRef, orderBy("createdAt", "asc"));
    const querySnapshot = await getDocs(q);

    let comments = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      comments.push({
        id: doc.id,
        trainerName: data.trainerName || "Anonymous Trainer", // ✅ Ensure trainer name is always set
        profilePicture: data.profilePicture || "/images/default-avatar.png", // ✅ Ensure profile picture is always set
        text: data.text,
        createdAt: data.createdAt,
      });
    });

    return comments;
  } catch (error) {
    console.error("🔥 Error fetching comments:", error);
    return [];
  }
};

export const addComment = async (
  entryId,
  userId,
  trainerName,
  text,
  profilePicture,
) => {
  try {
    const commentData = {
      authorId: userId,
      trainerName: trainerName || "Anonymous Trainer",
      profilePicture: profilePicture || "/images/default-avatar.png", // ✅ Ensure profile picture is always stored
      text: text,
      createdAt: new Date(),
    };

    const docRef = await addDoc(
      collection(db, `entries/${entryId}/comments`),
      commentData,
    );
    console.log("✅ Comment successfully added:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("🔥 Error adding comment:", error);
    return null;
  }
};

/** 🔹 Function to Delete an Entry and Its Related Data */
export const deleteEntry = async (entryId, userId, imageUrl) => {
  try {
    console.log(`🗑️ Attempting to delete entry: ${entryId}`);

    // 1️⃣ Delete all comments associated with the entry
    const commentsRef = collection(db, `entries/${entryId}/comments`);
    const commentsSnapshot = await getDocs(commentsRef);

    const commentDeletePromises = commentsSnapshot.docs.map((comment) =>
      deleteDoc(doc(db, `entries/${entryId}/comments`, comment.id)),
    );
    await Promise.all(commentDeletePromises);
    console.log(`✅ Deleted all comments for entry: ${entryId}`);

    // 2️⃣ Delete the entry itself
    await deleteDoc(doc(db, "entries", entryId));
    console.log(`✅ Entry deleted successfully: ${entryId}`);

    // 3️⃣ If an image is associated, delete it from Firebase Storage
    if (imageUrl) {
      try {
        const storage = getStorage();
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
        console.log(`✅ Entry image deleted: ${imageUrl}`);
      } catch (error) {
        console.warn(
          `⚠️ Image deletion failed (may not exist): ${imageUrl}`,
          error,
        );
      }
    }

    return true;
  } catch (error) {
    console.error("🔥 Error deleting entry:", error);
    return false;
  }
};

export const deleteComment = async (entryId, commentId) => {
  try {
    const commentRef = doc(db, `entries/${entryId}/comments/${commentId}`);
    await deleteDoc(commentRef);
    return true; // ✅ Success
  } catch (error) {
    console.error("🔥 Error deleting comment:", error);
    return false; // ❌ Failed
  }
};

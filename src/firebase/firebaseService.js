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
  Timestamp,
  collectionGroup,
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
    const usersRef = collection(db, "users");
    const q1 = query(usersRef, where("trainerName", "==", trainerName));
    const q2 = query(usersRef, where("friendCode", "==", friendCode));

    const [trainerNameCheck, friendCodeCheck] = await Promise.all([
      getDocs(q1),
      getDocs(q2),
    ]);

    return {
      trainerNameExists: !trainerNameCheck.empty,
      friendCodeExists: !friendCodeCheck.empty,
    };
  } catch (error) {
    return { trainerNameExists: false, friendCodeExists: false };
  }
};

/** 🔹 Create a new user in Firestore */
export const createUserProfile = async (
  uid,
  email,
  trainerName,
  friendCode,
  friendCodeVisibility,
) => {
  try {
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

    return true;
  } catch (error) {
    return false;
  }
};

export const getUserProfile = async (userId, currentUser = null) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return {
        trainerName: "Unknown Trainer",
        profilePicture: "/images/default-avatar.png",
      };
    }

    const userData = userSnap.data();

    // ✅ Always return trainer name and profile picture
    const profile = {
      trainerName: userData.trainerName || "Unknown Trainer",
      profilePicture: userData.profilePicture || "/images/default-avatar.png",
    };

    // ✅ Friend Code & Email Visibility Logic
    if (currentUser && currentUser.uid === userId) {
      // 🔹 If the logged-in user is viewing their own profile, show everything
      profile.email = userData.email;
      profile.friendCode = userData.friendCode;
    } else {
      // 🔹 Otherwise, check visibility settings
      if (
        userData.friendCodeVisibility === "everyone" ||
        (userData.friendCodeVisibility === "registered" && currentUser)
      ) {
        profile.friendCode = userData.friendCode;
      }
    }

    return profile;
  } catch (error) {
    console.error("🔥 Error fetching user profile:", error);
    return {
      trainerName: "Unknown Trainer",
      profilePicture: "/images/default-avatar.png",
    };
  }
};

/** 🔹 Update user profile */
export const updateUserProfile = async (uid, updatedData) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, updatedData);

    return true;
  } catch (error) {
    return false;
  }
};

export const deleteUserProfile = async (uid) => {
  try {
    console.log(`🗑️ Deleting user profile and all related data for: ${uid}...`);

    // 🔹 Re-authenticate user before deletion
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user found.");

    const password = prompt(
      "Please enter your password to confirm account deletion:",
    );
    if (!password) throw new Error("Password required for re-authentication.");

    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);

    // 🔹 Delete all user data (entries, comments, images)
    await deleteUserData(uid);

    // 🔹 Finally, delete the user from Firebase Authentication
    await deleteUser(user);

    console.log(`✅ Successfully deleted user account and data: ${uid}`);
    return true;
  } catch (error) {
    console.error("🔥 Error deleting profile:", error);
    throw new Error("Failed to delete profile. " + error.message);
  }
};

/** 🔹 Deletes all user data when they delete their account */
export const deleteUserData = async (uid) => {
  try {
    console.log(`🗑️ Deleting user data for: ${uid}...`);

    // 🔹 1. Delete the user's own entries
    const entriesQuery = query(
      collection(db, "entries"),
      where("authorId", "==", uid),
    );
    const entriesSnapshot = await getDocs(entriesQuery);

    const deleteEntryPromises = entriesSnapshot.docs.map(async (entryDoc) => {
      // Delete all comments under this entry first
      const commentsRef = collection(db, `entries/${entryDoc.id}/comments`);
      const commentsSnapshot = await getDocs(commentsRef);

      const deleteCommentsPromises = commentsSnapshot.docs.map((comment) =>
        deleteDoc(doc(db, `entries/${entryDoc.id}/comments`, comment.id)),
      );
      await Promise.all(deleteCommentsPromises);

      // Delete the entry itself
      await deleteDoc(entryDoc.ref);
    });

    await Promise.all(deleteEntryPromises);

    // 🔹 2. Delete all comments the user made on other people's entries
    const commentsQuery = query(
      collectionGroup(db, "comments"),
      where("authorId", "==", uid),
    );
    const commentsSnapshot = await getDocs(commentsQuery);

    const deleteUserCommentsPromises = commentsSnapshot.docs.map((comment) =>
      deleteDoc(comment.ref),
    );
    await Promise.all(deleteUserCommentsPromises);

    // 🔹 3. Delete profile picture
    await deleteProfilePicture(uid);

    // 🔹 4. Delete user document from Firestore
    await deleteDoc(doc(db, "users", uid));

    console.log(`✅ Successfully deleted all data for user: ${uid}`);
    return true;
  } catch (error) {
    console.error("🔥 Error deleting user data:", error);
    return false;
  }
};

/** 🔹 Upload Profile Picture */
export const uploadProfilePicture = async (uid, file) => {
  try {
    if (!file || !file.name) {
      throw new Error("Invalid file. Please select a valid image.");
    }

    // ✅ Ensure the file is correctly passed to Firebase Storage
    const storageRef = ref(storage, `profilePictures/${uid}/profile.jpg`);

    // ✅ Use uploadBytes instead of expecting a 'path' property
    const snapshot = await uploadBytes(storageRef, file);

    // ✅ Get the download URL for the uploaded image
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    return null;
  }
};

/** 🔹 Delete profile picture and reset to default */
export const deleteProfilePicture = async (uid) => {
  try {
    const storageRef = ref(storage, `profilePictures/${uid}/profile.jpg`);

    // ✅ Check if the profile picture exists before deleting
    try {
      await getMetadata(storageRef); // Will throw an error if file does not exist
    } catch (error) {
      return;
    }

    await deleteObject(storageRef);
  } catch (error) {}
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
      entries.push({ id: doc.id, ...entryData });
    });

    return entries.slice(0, limit);
  } catch (error) {
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
    return docRef.id;
  } catch (error) {
    return null;
  }
};

export const uploadEntryImage = async (userId, file) => {
  try {
    if (!file) throw new Error("Invalid file.");

    const storageRef = ref(getStorage(), `entryImages/${userId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    return null;
  }
};

export const toggleLike = async (entryId, userId) => {
  try {
    const entryRef = doc(db, "entries", entryId);
    const entrySnapshot = await getDoc(entryRef);

    if (!entrySnapshot.exists()) {
      return false;
    }

    const entryData = entrySnapshot.data();
    const isLiked = entryData.likes.includes(userId);

    await updateDoc(entryRef, {
      likes: isLiked
        ? arrayRemove(userId) // Remove like
        : arrayUnion(userId), // Add like
    });

    return true;
  } catch (error) {
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
    return docRef.id;
  } catch (error) {
    return null;
  }
};

/** 🔹 Function to Delete an Entry and Its Related Data */
export const deleteEntry = async (entryId, userId, imageUrl) => {
  try {
    // 1️⃣ Delete all comments associated with the entry
    const commentsRef = collection(db, `entries/${entryId}/comments`);
    const commentsSnapshot = await getDocs(commentsRef);

    const commentDeletePromises = commentsSnapshot.docs.map((comment) =>
      deleteDoc(doc(db, `entries/${entryId}/comments`, comment.id)),
    );
    await Promise.all(commentDeletePromises);

    // 2️⃣ Delete the entry itself
    await deleteDoc(doc(db, "entries", entryId));

    // 3️⃣ If an image is associated, delete it from Firebase Storage
    if (imageUrl) {
      try {
        const storage = getStorage();
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      } catch (error) {}
    }

    return true;
  } catch (error) {
    return false;
  }
};

export const deleteComment = async (entryId, commentId) => {
  try {
    const commentRef = doc(db, `entries/${entryId}/comments/${commentId}`);
    await deleteDoc(commentRef);
    return true; // ✅ Success
  } catch (error) {
    return false; // ❌ Failed
  }
};

const getPastWeekTimestamp = () => {
  const now = new Date();
  now.setDate(now.getDate() - 7); // 🔹 Get date 7 days ago
  return Timestamp.fromDate(now);
};

/** ✅ Get number of posts and comments made by each user in the past week */
export const getResearcherOfTheWeek = async () => {
  const weekAgo = getPastWeekTimestamp();
  const usersStats = {};

  try {
    // 🔹 Count entries in the past week
    const entriesQuery = query(
      collection(db, "entries"),
      where("createdAt", ">", weekAgo),
    );
    const entriesSnapshot = await getDocs(entriesQuery);

    entriesSnapshot.forEach((doc) => {
      const { authorId } = doc.data();
      if (!usersStats[authorId])
        usersStats[authorId] = { entries: 0, comments: 0 };
      usersStats[authorId].entries += 1;
    });

    // 🔹 Count comments in the past week
    const commentsQuery = query(
      collection(db, "entries"),
      orderBy("createdAt", "desc"),
    );
    const commentsSnapshot = await getDocs(commentsQuery);

    commentsSnapshot.forEach((entryDoc) => {
      const commentsRef = collection(db, `entries/${entryDoc.id}/comments`);
      commentsRef.forEach((comment) => {
        const { authorId } = comment.data();
        if (!usersStats[authorId])
          usersStats[authorId] = { entries: 0, comments: 0 };
        usersStats[authorId].comments += 1;
      });
    });

    // 🔹 Find top contributor
    let topUser = null;
    let maxContributions = 0;
    for (const userId in usersStats) {
      const contributions =
        usersStats[userId].entries + usersStats[userId].comments;
      if (contributions > maxContributions) {
        maxContributions = contributions;
        topUser = userId;
      }
    }

    console.log(
      "🔥 Researcher of the week:",
      topUser,
      "with contributions:",
      maxContributions,
    );
    return topUser
      ? { userId: topUser, contributions: maxContributions }
      : null;
  } catch (error) {
    console.error("🔥 Error fetching researcher of the week:", error);
    return null;
  }
};

/** 🔹 Get Researcher of the Week based on past week's contributions */
export const getResearcherOfTheWeekWithProfile = async () => {
  try {
    console.log("📡 Fetching Researcher of the Week...");

    // ✅ Get the timestamp for 7 days ago
    const oneWeekAgo = Timestamp.fromDate(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    );

    // ✅ Query entries made in the past week
    const entriesQuery = query(
      collection(db, "entries"),
      where("createdAt", ">", oneWeekAgo),
      orderBy("createdAt", "desc"),
    );

    // ✅ Query comments made in the past week
    const commentsQuery = query(
      collectionGroup(db, "comments"),
      where("createdAt", ">", oneWeekAgo),
      orderBy("createdAt", "desc"),
    );

    const [entriesSnapshot, commentsSnapshot] = await Promise.all([
      getDocs(entriesQuery),
      getDocs(commentsQuery),
    ]);

    // ✅ Count entries & comments per user
    const contributionCount = {};

    entriesSnapshot.forEach((doc) => {
      const { authorId } = doc.data();
      contributionCount[authorId] = (contributionCount[authorId] || 0) + 1;
    });

    commentsSnapshot.forEach((doc) => {
      const { authorId } = doc.data();
      contributionCount[authorId] = (contributionCount[authorId] || 0) + 1;
    });

    console.log("📊 Contribution Counts:", contributionCount);

    // ✅ Find the user with the most contributions
    const topResearcherId = Object.keys(contributionCount).reduce((a, b) =>
      contributionCount[a] > contributionCount[b] ? a : b,
    );

    if (!topResearcherId) {
      console.warn("⚠️ No valid researcher found this week.");
      return null;
    }

    // ✅ Fetch top researcher's profile
    const researcherProfile = await getUserProfile(topResearcherId);

    return {
      trainerName: researcherProfile?.trainerName || "Anonymous Trainer",
      profilePicture:
        researcherProfile?.profilePicture || "/images/default-avatar.png",
      contributions: contributionCount[topResearcherId],
    };
  } catch (error) {
    console.error("🔥 Error fetching Researcher of the Week:", error);
    return null;
  }
};

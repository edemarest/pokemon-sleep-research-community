import { db } from "./firebaseConfig";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
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

/** 🔹 Fetch user data by UID */
export const getUserProfile = async (uid) => {
  try {
    console.log("📡 Fetching user profile for UID:", uid);
    const userRef = doc(db, "users", uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      console.log("✅ User profile data:", docSnap.data());
      return docSnap.data();
    } else {
      console.warn("⚠️ User profile not found.");
      return null;
    }
  } catch (error) {
    console.error("🔥 Error fetching user profile:", error);
    return null;
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

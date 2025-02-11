// firebaseService.js

import { db } from "./firebaseConfig";
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";

/** 🔹 Check if a trainer name or friend code already exists */
export const checkUserExists = async (trainerName, friendCode) => {
  try {
    const usersRef = collection(db, "users");

    // Query Firestore for existing trainer name OR friend code
    const q = query(usersRef, where("trainerName", "==", trainerName));
    const q2 = query(usersRef, where("friendCode", "==", friendCode));

    const trainerNameCheck = await getDocs(q);
    const friendCodeCheck = await getDocs(q2);

    return {
      trainerNameExists: !trainerNameCheck.empty,
      friendCodeExists: !friendCodeCheck.empty,
    };
  } catch (error) {
    console.error("Error checking user existence:", error);
    return { trainerNameExists: false, friendCodeExists: false };
  }
};

/** 🔹 Create a new user in Firestore */
export const createUserProfile = async (uid, email, trainerName, friendCode) => {
  try {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, {
      uid,
      email,
      trainerName,
      friendCode,
      createdAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error("Error creating user profile:", error);
    return false;
  }
};

/** 🔹 Fetch user data by UID */
export const getUserProfile = async (uid) => {
  try {
    const userRef = doc(db, "users", uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.warn("User profile not found.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

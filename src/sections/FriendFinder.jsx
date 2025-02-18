import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getPublicTrainerCodes,
  getUserProfile,
} from "../firebase/FirebaseService";
import CodeCard from "./CodeCard";
import "../styles/FriendFinder.css";

const FriendFinder = () => {
  const { user } = useAuth();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // ✅ Fetch public trainer codes (runs even if user is logged out)
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const trainerData = await getPublicTrainerCodes();
        setTrainers(trainerData);
      } catch (error) {
        console.error("🔥 Error fetching trainer codes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainers();
  }, []);

  // ✅ Fetch user profile only when logged in
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.uid) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error("🔥 Error fetching user profile:", error);
        }
      } else {
        setUserProfile(null); // ✅ Reset when logged out
      }
    };
    fetchUserProfile();
  }, [user]);

  return (
    <section className="friend-finder w-full max-w-3xl p-4">
      <h2 className="text-2xl font-title mb-3 font-bold">
        Looking for Friends?
      </h2>

      {loading ? (
        <p className="text-gray-500">Loading trainers...</p>
      ) : (
        <div className="friend-list">
          {/* ✅ Show user's own friend code only if logged in & visible */}
          {user && userProfile && userProfile.friendCode ? (
            <>
              <CodeCard key={user.uid} trainer={userProfile} isUser />
              {console.log("✅ User's card found and displayed")}
            </>
          ) : (
            console.log("⚠️ User's card not found or not visible")
          )}

          {/* ✅ Show other trainers, even if user is logged out */}
          {trainers
            .filter((t) => t.trainerName) // ✅ Ensure trainerName is valid before rendering
            .map((trainer) => (
              <CodeCard key={trainer.uid} trainer={trainer} />
            ))}
        </div>
      )}

      {/* ✅ Show correct message depending on login state */}
      {!user ? (
        <p className="mt-3 text-textDark text-sm flex items-center gap-1">
          Sign in to add your code to the list and find more friends!
        </p>
      ) : (
        <p className="mt-3 text-textDark text-sm flex items-center gap-1">
          Change your code visibility settings in the Profile Editor!
        </p>
      )}
    </section>
  );
};

export default FriendFinder;

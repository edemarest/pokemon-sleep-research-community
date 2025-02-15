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

  // Fetch public trainer codes
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const trainerData = await getPublicTrainerCodes(user);
        setTrainers(trainerData);
      } catch (error) {
        console.error("🔥 Error fetching trainer codes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainers();
  }, [user]); // No refreshTrigger needed

  // Fetch user profile (to check visibility)
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error("🔥 Error fetching user profile:", error);
        }
      }
    };
    fetchUserProfile();
  }, [user]); // No refreshTrigger needed

  return (
    <section className="friend-finder w-full max-w-3xl p-4">
      <h2 className="text-2xl font-title mb-3">Looking for Friends</h2>

      {loading ? (
        <p className="text-gray-500">Loading trainers...</p>
      ) : (
        <div className="friend-list">
          {/* Show user's card with a different style if their code is visible */}
          {userProfile && userProfile.friendCodeVisibility !== "hidden" ? (
            <>
              <CodeCard key={user.uid} trainer={userProfile} isUser />
              {console.log("User's card found and displayed")}
            </>
          ) : (
            console.log("User's card not found or not visible")
          )}
          {/* Show other trainers */}
          {trainers
            .filter((t) => t.uid !== user?.uid)
            .map((trainer) => (
              <CodeCard key={trainer.uid} trainer={trainer} />
            ))}
        </div>
      )}

      {!user ? (
        <p className="mt-3 text-textDark text-sm flex items-center gap-1">
          <span>😊</span> Sign up to add your code and find more friends!
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

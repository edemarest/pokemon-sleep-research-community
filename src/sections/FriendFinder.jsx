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

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const trainerData = await getPublicTrainerCodes();
        setTrainers(trainerData);
      } catch (error) {
        console.error("Error fetching trainer codes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainers();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.uid) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUserProfile(null);
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
          {user && userProfile && userProfile.friendCode ? (
            <>
              <CodeCard key={user.uid} trainer={userProfile} isUser />
            </>
          ) : null}
          {trainers
            .filter((t) => t.trainerName && t.uid !== user?.uid)
            .map((trainer) => (
              <CodeCard key={trainer.uid} trainer={trainer} />
            ))}
        </div>
      )}

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

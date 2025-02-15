import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  uploadProfilePicture,
  checkUserExists,
} from "../../firebase/FirebaseService";
import "../../styles/global.css";
import { FaEdit, FaTrash, FaCheck, FaUpload, FaRedo } from "react-icons/fa";

const ProfileDropdown = ({ setProfilePic }) => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [trainerName, setTrainerName] = useState("");
  const [friendCode, setFriendCode] = useState("");
  const [friendCodeVisibility, setFriendCodeVisibility] =
    useState("registered");
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);

  const dropdownRef = useRef(null);

  // Default profile picture URL
  const defaultProfilePic = "/images/default-avatar.png"; // Update with your default image path

  const [profilePic, setProfilePicState] = useState(defaultProfilePic);
  const [tempProfilePic, setTempProfilePic] = useState(null); // Temporary picture for preview only

  // 🔹 Fetch user profile and update states
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const data = await getUserProfile(user.uid);
          if (data) {
            setProfile(data);
            setTrainerName(data.trainerName || "");
            setFriendCode(data.friendCode || "");
            setFriendCodeVisibility(data.friendCodeVisibility || "registered");
            setProfilePicState(data.profilePicture || defaultProfilePic);
          }
        } catch (err) {
          console.error("⚠️ Error fetching profile:", err);
        }
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  // 🔹 Friend Code Formatting (Auto-add dashes)
  const formatFriendCode = (input) => {
    let numbersOnly = input.replace(/\D/g, "").slice(0, 12);
    let formattedCode = numbersOnly.replace(/(\d{4})(?=\d)/g, "$1-");
    setFriendCode(formattedCode);
  };

  // 🔹 Handle Profile Update (Final save to Firestore)
  const handleUpdate = async () => {
    setLoading(true);

    // Validate unique trainer name and friend code
    if (
      trainerName !== profile?.trainerName ||
      friendCode !== profile?.friendCode
    ) {
      try {
        const { trainerNameExists, friendCodeExists } = await checkUserExists(
          trainerName,
          friendCode,
        );
        if (trainerNameExists && trainerName !== profile?.trainerName) {
          alert("Trainer Name is already taken.");
          setLoading(false);
          return;
        }
        if (friendCodeExists && friendCode !== profile?.friendCode) {
          alert("This Friend Code is already in use.");
          setLoading(false);
          return;
        }
      } catch (err) {
        alert("Error checking existing data.");
        console.error("⚠️ Error validating trainerName/friendCode:", err);
        setLoading(false);
        return;
      }
    }

    // 🔹 Update Firestore
    try {
      const updatedData = { trainerName, friendCode, friendCodeVisibility };

      // 🔹 If a new profile picture is uploaded, update Firestore
      if (tempProfilePic) {
        updatedData.profilePicture = tempProfilePic;
        setProfilePicState(tempProfilePic);
        setProfilePic(tempProfilePic);
      }

      const success = await updateUserProfile(user.uid, updatedData);
      if (success) {
        setProfile({ ...profile, ...updatedData });
        setIsEditing(false);
        setTempProfilePic(null); // Reset temp preview
      } else {
        alert("Failed to update profile. Try again.");
      }
    } catch (err) {
      alert("Error updating profile.");
      console.error("⚠️ Error updating profile:", err);
    }

    setLoading(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      console.error("⚠️ No file selected.");
      return;
    }

    console.log("📂 Selected File:", file);

    try {
      const newProfilePic = await uploadProfilePicture(user.uid, file);
      if (newProfilePic) {
        setTempProfilePic(newProfilePic); // ✅ Update preview, but do NOT save yet
      }
    } catch (error) {
      console.error("🔥 Error uploading profile picture:", error);
    }
  };

  // 🔹 Handle Reset Profile Picture
  const handleResetProfilePicture = async () => {
    setTempProfilePic(defaultProfilePic); // Reset preview only
  };

  // 🔹 Handle Delete Profile
  const handleDeleteProfile = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account?",
    );
    if (confirmed) {
      try {
        await deleteUserProfile(user.uid);
        await logout();
        window.location.reload();
      } catch (err) {
        console.error("⚠️ Error deleting profile:", err);
        alert("Failed to delete profile. Try again.");
      }
    }
  };

  // 🔹 Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    isDropdownOpen && (
      <div
        ref={dropdownRef}
        className="absolute top-16 right-0 bg-card p-5 rounded-lg shadow-lg max-w-xs w-80 flex flex-col gap-3 z-50"
      >
        {loading ? (
          <p className="text-body">Loading profile...</p>
        ) : profile ? (
          <div className="text-center">
            {/* 🔹 Profile Picture */}
            <div className="flex justify-center">
              <img
                src={tempProfilePic || profilePic} // Use temp preview if exists
                alt="Profile"
                className="w-20 h-20 rounded-full border-2 border-textDark"
                onError={(e) => (e.target.src = "/images/default-avatar.png")}
              />
            </div>

            {/* 🔹 Upload New Profile Picture */}
            {isEditing && (
              <div className="flex flex-col items-center gap-2 mt-3">
                <label className="btn-primary flex items-center justify-center cursor-pointer">
                  <FaUpload className="mr-2" /> Upload Picture
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                <button
                  className="text-textDark underline flex items-center justify-center"
                  onClick={handleResetProfilePicture}
                >
                  <FaRedo className="mr-2" /> Reset to Default
                </button>
              </div>
            )}

            {/* 🔹 Profile Details */}
            <div className="mt-4">
              <label className="form-label">Trainer Name</label>
              {isEditing ? (
                <input
                  type="text"
                  className="form-input"
                  value={trainerName}
                  onChange={(e) => setTrainerName(e.target.value)}
                />
              ) : (
                <p className="text-body">{profile?.trainerName || "N/A"}</p>
              )}

              <label className="form-label">Friend Code</label>
              {isEditing ? (
                <input
                  type="text"
                  className="form-input"
                  value={friendCode}
                  onChange={(e) => formatFriendCode(e.target.value)}
                />
              ) : (
                <p className="text-body">{profile?.friendCode || "N/A"}</p>
              )}
              <label className="form-label">Friend Code Visibility</label>
              {isEditing ? (
                <select
                  className="select-input mb-2"
                  value={friendCodeVisibility}
                  onChange={(e) => setFriendCodeVisibility(e.target.value)}
                >
                  <option value="registered">
                    Display only to registered users
                  </option>
                  <option value="everyone">Display to everyone</option>
                  <option value="hidden">Do not display</option>
                </select>
              ) : (
                <p className="text-body">
                  {profile?.friendCodeVisibility === "registered"
                    ? "Only registered users"
                    : profile?.friendCodeVisibility === "everyone"
                      ? "Everyone"
                      : "Hidden"}
                </p>
              )}
              <label className="form-label">Registered Email</label>
              <p className="text-body">{profile?.email || "N/A"}</p>
            </div>

            {/* 🔹 Buttons */}
            <div className="flex flex-col items-center gap-2 mt-1">
              {isEditing ? (
                <>
                  <button
                    className="btn-primary flex items-center justify-center w-full"
                    onClick={handleUpdate}
                    disabled={loading}
                  >
                    <FaCheck className="mr-2" />{" "}
                    {loading ? "Saving..." : "Update Profile"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn-primary flex items-center justify-center w-full"
                    onClick={() => setIsEditing(true)}
                  >
                    <FaEdit className="mr-2" /> Edit Profile
                  </button>
                  <button
                    className="text-textDark underline flex items-center justify-center w-full"
                    onClick={handleDeleteProfile}
                  >
                    <FaTrash className="mr-2" /> Delete Account
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <p className="text-body">No profile data found.</p>
        )}
      </div>
    )
  );
};

export default ProfileDropdown;

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/AuthSection.css";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import ProfileDropdown from "./ProfileDropdown";
import { getUserProfile } from "../../firebase/firebaseService";

const DEFAULT_PFP = "/images/default-avatar.png";

const AuthSection = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [profilePic, setProfilePic] = useState(DEFAULT_PFP);
  const [isSignup, setIsSignup] = useState(false); // ✅ Toggle for signup/login
  const dropdownRef = useRef(null);

  // Fetch Profile Picture
  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (user) {
        const profile = await getUserProfile(user.uid);
        if (profile?.profilePicture) {
          setProfilePic(profile.profilePicture);
        }
      }
    };
    fetchProfilePicture();
  }, [user]);

  // Handle Click Outside Dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="auth-section">
      {user ? (
        <div className="auth-user">
          <img
            src={profilePic}
            alt="Profile"
            className="profile-icon"
            onClick={() => setShowDropdown(!showDropdown)}
            onError={(e) => (e.target.src = DEFAULT_PFP)}
          />
          {showDropdown && <ProfileDropdown setProfilePic={setProfilePic} />}
          <button className="btn-logout" onClick={logout}>
            Logout
          </button>
        </div>
      ) : (
        <div className="auth-dropdown-container" ref={dropdownRef}>
          <button
            className="btn-primary"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {isSignup ? "Sign Up" : "Login"}
          </button>

          {showDropdown && (
            <>
              {isSignup ? (
                <SignupForm setIsSignup={setIsSignup} />
              ) : (
                <LoginForm setIsSignup={setIsSignup} />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AuthSection;

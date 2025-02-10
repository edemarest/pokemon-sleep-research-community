import React, { useState } from "react";
import "../styles/Navbar.css"; // Reuse the styles for the Auth Section

const AuthSection = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const userProfilePic = "https://via.placeholder.com/40"; // Placeholder profile image

  return (
    <div className="auth-section">
      {isLoggedIn ? (
        <img src={userProfilePic} alt="Profile" className="profile-icon" />
      ) : (
        <>
          <button className="auth-button" onClick={() => alert("Login Clicked")}>Login</button>
          <button className="auth-button" onClick={() => alert("Signup Clicked")}>Sign Up</button>
        </>
      )}
    </div>
  );
};

export default AuthSection;

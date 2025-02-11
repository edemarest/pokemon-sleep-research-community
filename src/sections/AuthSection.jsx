import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; 
import { createUserProfile, getUserProfile, checkUserExists } from "../firebase/firebaseService"; 
import "../styles/Navbar.css"; 
import "../styles/global.css";

const AuthSection = () => {
  const { user, register, login, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [friendCode, setFriendCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatFriendCode = (input) => {
    let numbersOnly = input.replace(/\D/g, "").slice(0, 12);
    let formattedCode = numbersOnly.replace(/(\d{4})(?=\d)/g, "$1-");
    setFriendCode(formattedCode);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isSignup) {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }

      // Check if trainer name or friend code already exists
      const { trainerNameExists, friendCodeExists } = await checkUserExists(username, friendCode);
      if (trainerNameExists) {
        setError("Trainer Name is already taken.");
        setLoading(false);
        return;
      }
      if (friendCodeExists) {
        setError("This Friend Code is already in use.");
        setLoading(false);
        return;
      }

      // Register the user in Firebase Auth
      try {
        const userCredential = await register(email, password);
        const uid = userCredential.user.uid;

        // Store user data in Firestore
        await createUserProfile(uid, email, username, friendCode);
        setShowDropdown(false);
      } catch (err) {
        setError(err.message);
      }
    } else {
      // Logging in
      try {
        const userCredential = await login(email, password);
        const uid = userCredential.user.uid;

        // Fetch user profile from Firestore
        const userData = await getUserProfile(uid);
        if (userData) {
          console.log("User logged in:", userData);
        }
        setShowDropdown(false);
      } catch (err) {
        setError(err.message);
      }
    }

    setLoading(false);
  };

  return (
    <div className="auth-section">
      {user ? (
        <div className="auth-user">
          <img src="https://via.placeholder.com/40" alt="Profile" className="profile-icon" />
          <button className="btn-logout" onClick={logout}>Logout</button>
        </div>
      ) : (
        <div className="auth-dropdown-container" ref={dropdownRef}>
          <button className="btn-primary" onClick={() => setShowDropdown(!showDropdown)} disabled={loading}>
            {isSignup ? "Sign Up" : "Login"}
          </button>

          {showDropdown && (
            <div className="auth-dropdown">
              <form className="auth-form" onSubmit={handleAuth}>
                {error && <p className="error-text">{error}</p>}

                {isSignup && (
                  <>
                    <label className="form-label">Enter Your Trainer Name</label>
                    <input
                      type="text"
                      placeholder="Trainer Name"
                      className="form-input"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />

                    <label className="form-label">Enter your Pokémon Sleep Friend Code</label>
                    <input
                      type="text"
                      placeholder="0000-0000-0000"
                      className="form-input"
                      value={friendCode}
                      onChange={(e) => formatFriendCode(e.target.value)}
                      required
                    />
                  </>
                )}

                <label className="form-label">What's your email?</label>
                <input
                  type="email"
                  placeholder="Email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <label className="form-label">Set your password</label>
                <input
                  type="password"
                  placeholder="Password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                {isSignup && (
                  <>
                    <label className="form-label">Confirm your password</label>
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      className="form-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </>
                )}

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Processing..." : isSignup ? "Create Account" : "Log In"}
                </button>
              </form>

              <p className="switch-text" onClick={() => setIsSignup(!isSignup)}>
                <strong>{isSignup ? "Already have an account? Login" : "Don't have an account? Sign up"}</strong>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuthSection;

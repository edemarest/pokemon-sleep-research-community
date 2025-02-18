import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  createUserProfile,
  checkUserExists,
} from "../../firebase/FirebaseService";
import "../../styles/AuthSection.css";

const SignUpForm = ({ setIsSignup }) => {
  const { register } = useAuth();
  const [signupStep, setSignupStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [friendCode, setFriendCode] = useState("");
  const [friendCodeVisibility, setFriendCodeVisibility] =
    useState("registered");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const formatFriendCode = (input) => {
    let numbersOnly = input.replace(/\D/g, "").slice(0, 12);
    let formattedCode = numbersOnly.replace(/(\d{4})(?=\d)/g, "$1-");
    setFriendCode(formattedCode);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (signupStep === 2) {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }

      const { trainerNameExists, friendCodeExists } = await checkUserExists(
        username,
        friendCode,
      );
      if (trainerNameExists || friendCodeExists) {
        setError(
          trainerNameExists
            ? "Trainer Name is taken."
            : "Friend Code is in use.",
        );
        setLoading(false);
        return;
      }

      try {
        const userCredential = await register(email, password);
        const uid = userCredential.user.uid;
        await createUserProfile(
          uid,
          email,
          username,
          friendCode,
          friendCodeVisibility,
        );
      } catch (err) {
        setError(err.message);
      }
    } else {
      setSignupStep(2);
    }

    setLoading(false);
  };

  // **Check if Step 1 fields are filled**
  const isStep1Valid =
    email.trim() !== "" &&
    password.trim() !== "" &&
    confirmPassword.trim() !== "";

  // **Check if Step 2 fields are filled**
  const isStep2Valid = username.trim() !== "" && friendCode.trim() !== "";

  return (
    <div className="auth-dropdown">
      {error && <p className="error-text">{error}</p>}

      <form className="auth-form" onSubmit={handleSignup}>
        {signupStep === 1 ? (
          <>
            <label className="form-label">Enter your email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label className="form-label">Choose a password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label className="form-label">Confirm your password</label>
            <input
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button
              type="button"
              className={isStep1Valid ? "btn-primary" : "btn-disabled"}
              onClick={() => setSignupStep(2)}
              disabled={!isStep1Valid || loading}
            >
              Continue
            </button>
            {/* 🔹 "Already have an account?" Switch to Login */}
            <p className="switch-text mt-3" onClick={() => setIsSignup(false)}>
              Already have an account?{" "}
              <span className="underline cursor-pointer">Login</span>
            </p>
          </>
        ) : (
          <>
            <label className="form-label">Trainer Name</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label className="form-label">Pokémon Sleep Friend Code</label>
            <input
              type="text"
              className="form-input"
              value={friendCode}
              onChange={(e) => formatFriendCode(e.target.value)}
              required
            />

            <label className="form-label">Friend Code Visibility</label>
            <select
              className="select-input mb-4"
              value={friendCodeVisibility}
              onChange={(e) => setFriendCodeVisibility(e.target.value)}
            >
              <option value="registered">
                Display only to registered users
              </option>
              <option value="everyone">Display to everyone</option>
              <option value="hidden">Do not display</option>
            </select>

            <div className="button-group">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSignupStep(1)}
                disabled={loading}
                style={{ marginRight: "10px" }}
              >
                Back
              </button>
              <button
                type="submit"
                className={isStep2Valid ? "btn-primary" : "btn-disabled"}
                disabled={!isStep2Valid || loading}
              >
                {loading ? "Processing..." : "Create Account"}
              </button>
            </div>

            {/* 🔹 "Already have an account?" Switch to Login */}
            <p className="switch-text mt-3" onClick={() => setIsSignup(false)}>
              Already have an account?{" "}
              <span className="underline cursor-pointer">Login</span>
            </p>
          </>
        )}
      </form>
    </div>
  );
};

export default SignUpForm;

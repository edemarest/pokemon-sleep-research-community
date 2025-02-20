import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/AuthSection.css";
import "../../styles/global.css";

const LoginForm = ({ setIsSignup }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      switch (err.code) {
        case "auth/invalid-credential":
          setError("Incorrect email address or password.");
          break;
        case "auth/user-disabled":
          setError("This user has been disabled.");
          break;
        case "auth/user-not-found":
          setError("No user found with this email.");
          break;
        default:
          setError("An error occurred. Please try again.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="auth-dropdown">
      {error && <p className="error-text">{error}</p>}

      <form className="auth-form" onSubmit={handleLogin}>
        <label className="form-label">Enter your email</label>
        <input
          type="email"
          placeholder="Email"
          className="form-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="form-label">Enter your password</label>
        <input
          type="password"
          placeholder="Password"
          className="form-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className={email && password ? "btn-primary" : "btn-disabled"}
          disabled={!email || !password || loading}
        >
          {loading ? "Processing..." : "Log In"}
        </button>
      </form>

      <p className="switch-text" onClick={() => setIsSignup(true)}>
        <strong>Don't have an account? Sign up</strong>
      </p>
    </div>
  );
};

export default LoginForm;

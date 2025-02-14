import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/AuthSection.css";

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
      setError(err.message);
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

import React, { useState } from "react";
import "../styles/AuthSection.css";

const AuthSection = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-container">
      <h2 className="text-2xl font-title mb-4">{isLogin ? "Login" : "Sign Up"}</h2>
      <form className="auth-form">
        <input type="text" placeholder="Email" className="auth-input" required />
        <input type="password" placeholder="Password" className="auth-input" required />
        {!isLogin && (
          <input type="text" placeholder="Username" className="auth-input" required />
        )}
        <button type="submit" className="auth-button">
          {isLogin ? "Login" : "Sign Up"}
        </button>
      </form>
      <p className="switch-text" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
      </p>
    </div>
  );
};

export default AuthSection;

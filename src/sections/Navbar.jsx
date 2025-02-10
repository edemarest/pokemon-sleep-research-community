import React from "react";
import "../styles/Navbar.css";
import AuthSection from "./AuthSection"; // Import the AuthSection component

const Navbar = () => {
  return (
    <nav className="navbar">
      {/* Left Side - Logo or Title */}
      <div className="nav-links">
        <a href="/" className="nav-link">Home</a>
        <a href="/entries" className="nav-link">Research Log</a>
      </div>

      {/* Right Side - Auth Section */}
      <AuthSection />
    </nav>
  );
};

export default Navbar;

import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import AuthSection from "./auth/AuthSection"; // Import the AuthSection component

const Navbar = () => {
  return (
    <nav className="navbar">
      {/* Left Side - Logo or Title */}
      <div className="nav-links">
        <Link to="/" className="nav-link">
          Home
        </Link>
        <Link to="/entries" className="nav-link">
          Research Log
        </Link>
      </div>

      {/* Right Side - Auth Section */}
      <AuthSection />
    </nav>
  );
};

export default Navbar;

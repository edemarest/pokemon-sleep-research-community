import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import AuthSection from "./auth/AuthSection"; // Import the AuthSection component

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      {/* Hamburger Menu (Mobile) */}
      <div className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>

      {/* Navigation Links (Hidden on Mobile Until Menu Opens) */}
      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
          Home
        </Link>
        <Link to="/entries" className="nav-link" onClick={() => setMenuOpen(false)}>
          Research Log
        </Link>
      </div>

      {/* Right Side - Auth Section (Always Visible) */}
      <AuthSection />
    </nav>
  );
};

export default Navbar;

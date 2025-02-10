import React from "react";
import "../styles/Header.css";

const Header = () => {
  return (
    <header className="header-container">
      <div className="logo">
        <h1 className="text-3xl font-title">Pokémon Sleep Research</h1>
      </div>
      <nav className="nav-menu">
        <ul className="nav-list">
          <li><a href="#" className="nav-link">Home</a></li>
          <li><a href="#" className="nav-link">Research Entries</a></li>
          <li><a href="#" className="nav-link">Friends</a></li>
          <li><a href="#" className="nav-link">Profile</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;

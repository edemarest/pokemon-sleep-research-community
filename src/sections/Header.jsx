import React from "react";
import "../styles/Header.css";
import Navbar from "./Navbar";

const Header = () => {
  return (
    <div>
      <Navbar />
      <header className="header-container">
        <div className="header-content">
          <h1 className="header-title">Pokémon Sleep Research Community</h1>
          <p className="header-caption">
            Sharing discoveries, tracking sleep, and building friendships
          </p>
        </div>
      </header>
    </div>
  );
};

export default Header;

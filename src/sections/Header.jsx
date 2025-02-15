import React from "react";
import "../styles/Header.css";
import Navbar from "./Navbar";

const Header = () => {
  return (
    <div>
      <Navbar />
      <header
        className="header-container"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(163, 217, 165, 0.8), rgba(163, 217, 165, 0.4)), url('/images/header_image.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center top 20%",
          backgroundRepeat: "no-repeat",
        }}
      >
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

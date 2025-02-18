import React from "react";
import "../styles/Header.css";
import Navbar from "./Navbar";

const Header = () => {
  return (
    <div>
      <Navbar />
      <header
        className="header-container mt-[75px]"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(163, 217, 165, 0.8), rgba(163, 217, 165, 0.4)), url('/images/header_image.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center top 30%",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div>
          <h1 className="header-title">Pokémon Sleep Research Community</h1>
        </div>
      </header>
      <div className="header-border"></div>
    </div>
  );
};

export default Header;

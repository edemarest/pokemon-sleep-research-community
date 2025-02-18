import React from "react";
import "../styles/Header.css";
import Navbar from "./Navbar";

const ResearchHeader = () => {
  return (
    <div>
      <Navbar />
      <header
        className="research-header-container mt-[75px]"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(229, 199, 168, 0.85), rgba(214, 165, 115, 0.85)), url('/images/header_image.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center top 30%",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div>
          <h1 className="research-header-title">
            Pokémon Sleep Research Community
          </h1>
        </div>
      </header>
      <div className="research-header-border"></div>
    </div>
  );
};

export default ResearchHeader;

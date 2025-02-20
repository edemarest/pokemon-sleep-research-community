import React from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import "../styles/Header.css";

const DynamicHeader = () => {
  const location = useLocation();
  const isEntriesPage = location.pathname === "/entries";

  return (
    <div>
      <Navbar />
      <motion.header
        className="header-container"
        initial={{ height: isEntriesPage ? "275px" : "175px", opacity: 1 }}
        animate={{
          height: isEntriesPage ? "175px" : "275px",
          backgroundImage: isEntriesPage
            ? `linear-gradient(to bottom, rgba(229, 199, 168, 0.85), rgba(214, 165, 115, 0.85)), url('/images/header_image.png')`
            : `linear-gradient(to bottom, rgba(163, 217, 165, 0.8), rgba(163, 217, 165, 0.4)), url('/images/header_image.png')`,
        }}
        style={{
          backgroundSize: "cover", // Ensures full image visibility
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center", // Centers background image
          overflow: "hidden", // Prevents cut-off issues
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <div className="header-content">
          <h1 className="header-title">Pokémon Sleep Research Community</h1>
        </div>
      </motion.header>
      <div className="header-border"></div>
    </div>
  );
};

export default DynamicHeader;

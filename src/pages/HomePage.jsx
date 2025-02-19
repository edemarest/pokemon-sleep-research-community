import React from "react";
import Header from "../sections/Header";
import ResearchEntries from "../sections/ResearchEntries";
import FriendFinder from "../sections/FriendFinder";
import ResearcherOfTheWeek from "../sections/ResearcherOfTheWeek"; // ✅ New Import
import Footer from "../sections/Footer";
import "../styles/HomePage.css";

const HomePage = () => {
  return (
    <div className="home-container">
      {/* ✅ Header stays clean (no background texture) */}
      <Header />

      {/* ✅ Main Content with texture background */}
      <div className="main-content">
        <main className="w-full max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Notebook Entries Section (Wider - 2/3 of page) */}
          <section className="md:col-span-2 w-full">
            <ResearchEntries />
          </section>

          {/* Friend Finder Section */}
          <section className="w-full flex flex-col gap-6">
            <FriendFinder />
            <ResearcherOfTheWeek /> {/* ✅ New Section */}
          </section>
        </main>
      </div>

      {/* ✅ Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;

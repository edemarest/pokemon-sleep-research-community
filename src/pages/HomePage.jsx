import React from "react";
import Header from "../sections/Header";
import ResearchEntries from "../sections/ResearchEntries";
import FriendFinder from "../sections/FriendFinder";
import "../styles/HomePage.css";

const HomePage = () => {
  return (
    <div className="bg-background min-h-screen flex flex-col text-textDark">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto py-10 px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Notebook Entries Section */}
        <section className="w-full">
          <ResearchEntries />
        </section>

        {/* Friend Finder Section */}
        <section className="w-full">
          <FriendFinder />
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-sm border-t border-textDark mt-10">
        Pokémon Sleep Research Community © 2025
      </footer>
    </div>
  );
};

export default HomePage;

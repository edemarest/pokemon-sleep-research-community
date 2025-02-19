import React from "react";
import DynamicHeader from "../sections/DynamicHeader";
import ResearchEntries from "../sections/ResearchEntries";
import FriendFinder from "../sections/FriendFinder";
import ResearcherOfTheWeek from "../sections/ResearcherOfTheWeek";
import Footer from "../sections/Footer";
import "../styles/HomePage.css";

const HomePage = () => {
  return (
    <div className="home-container">
      <DynamicHeader />

      <div className="main-content">
        <main className="w-full max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <section className="md:col-span-2 w-full">
            <ResearchEntries />
          </section>

          <section className="w-full flex flex-col gap-6">
            <FriendFinder />
            <ResearcherOfTheWeek />
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;

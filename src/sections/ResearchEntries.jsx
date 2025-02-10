import React from "react";
import "../styles/ResearchEntries.css";

const ResearchEntries = () => {
  const entries = [
    {
      id: 1,
      text: "Discovered a rare Pikachu sleep style!",
      image: "pikachu-sleep.jpg",
    },
    {
      id: 2,
      text: "My Snorlax reached 15,000 strength today!",
      image: "snorlax-strength.jpg",
    },
  ];

  return (
    <section className="research-entries w-full max-w-3xl p-4">
      <h2 className="text-2xl font-title mb-3">Recent Research Entries</h2>
      <div className="entries-container">
        {entries.map((entry) => (
          <div key={entry.id} className="entry-card">
            {entry.image && (
              <img src={entry.image} alt="Research entry" className="entry-image" />
            )}
            <p className="font-body">{entry.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ResearchEntries;

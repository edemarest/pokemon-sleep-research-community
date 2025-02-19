import React, { useEffect, useState } from "react";
import { getResearcherOfTheWeekWithProfile } from "../firebase/FirebaseService";

const ResearcherOfTheWeek = () => {
  const [researcher, setResearcher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResearcher = async () => {
      const result = await getResearcherOfTheWeekWithProfile();
      setResearcher(result);
      setLoading(false);
    };

    fetchResearcher();
  }, []);

  return (
    <div className="researcher-container bg-card p-4 rounded-lg shadow-md text-center">
      <h2 className="text-title text-2xl mb-2">Researcher of the Week</h2>
      {loading ? (
        <p className="text-body text-gray-500">
          Loading Researcher of the Week...
        </p>
      ) : researcher ? (
        <div className="flex flex-col items-center">
          <img
            src={researcher.profilePicture}
            alt={researcher.trainerName}
            className="w-16 h-16 rounded-full border-2 border-textDark mb-2"
          />
          <p className="font-bold text-lg">{researcher.trainerName}</p>
          <p className="text-small text-gray-500">
            {researcher.contributions} contributions this week
          </p>
        </div>
      ) : (
        <p className="text-body text-gray-500">
          No researcher selected this week.
        </p>
      )}
    </div>
  );
};

export default ResearcherOfTheWeek;

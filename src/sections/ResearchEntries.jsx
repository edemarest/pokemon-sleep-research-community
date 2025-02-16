import React, { useEffect, useState } from "react";
import { getEntries } from "../firebase/FirebaseService";
import Entry from "../sections/Entry";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { FaPencilAlt } from "react-icons/fa";

const ResearchEntries = () => {
  const [entries, setEntries] = useState([]);
  const { user } = useAuth();

  // Fetch only the 3 most recent entries
  useEffect(() => {
    getEntries(3).then(setEntries);
  }, []);

  return (
    <section className="research-entries w-full max-w-3xl p-4 bg-card rounded-lg shadow-md">
      <h2 className="text-title mb-3">Recent Research Entries</h2>

      {/* Display Entries */}
      <div className="entries-container flex flex-col gap-4">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <Entry key={entry.id} {...entry} currentUser={user} />
          ))
        ) : (
          <p className="text-small text-gray-500">No research entries yet.</p>
        )}
      </div>

      {/* "See More" & Create Entry (if logged in) */}
      <div className="mt-4 flex justify-center items-center gap-3">
        <Link to="/entries" className="btn-primary inline-block">
          See More Entries
        </Link>

        {/* Only show pencil icon for logged-in users */}
        {user && (
          <Link
            to="/create-entry"
            className="flex items-center justify-center bg-pastelPink text-white p-2 rounded-lg hover:opacity-85"
          >
            <FaPencilAlt className="mr-2" />
            Log Entry
          </Link>
        )}
      </div>

      {/* Show Sign-in Message for Logged-Out Users */}
      {!user && (
        <p className="text-small text-gray-500 mt-2 text-center">
          Sign in to make an entry!
        </p>
      )}
    </section>
  );
};

export default ResearchEntries;

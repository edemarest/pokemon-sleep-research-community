import React, { useEffect, useState } from "react";
import { getAllEntries } from "../firebase/FirebaseService";
import Entry from "../sections/Entry";
import { useAuth } from "../context/AuthContext";

const EntriesPage = () => {
  const [entries, setEntries] = useState([]);
  const [filterTag, setFilterTag] = useState(null);
  const { user } = useAuth();

  // Fetch entries (with optional filtering)
  useEffect(() => {
    getAllEntries(filterTag).then(setEntries);
  }, [filterTag]);

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h2 className="text-title mb-4">Research Log</h2>

      {/* Tag Filter */}
      <div className="flex gap-2 mb-4">
        {["All", "General", "Q&A", "Brags", "Fails"].map((tag) => (
          <button
            key={tag}
            onClick={() => setFilterTag(tag === "All" ? null : tag)}
            className={`px-4 py-2 rounded-lg text-sm ${
              filterTag === tag || (tag === "All" && !filterTag)
                ? "bg-accentBlue text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Display Entries */}
      <div className="flex flex-col gap-4">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <Entry key={entry.id} {...entry} currentUser={user} />
          ))
        ) : (
          <p className="text-small text-gray-500">No research entries found.</p>
        )}
      </div>
    </div>
  );
};

export default EntriesPage;

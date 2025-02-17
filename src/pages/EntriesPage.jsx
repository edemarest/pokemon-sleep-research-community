import React, { useEffect, useState, useRef } from "react";
import { getAllEntries, getUserProfile } from "../firebase/FirebaseService"; // ✅ Import getUserProfile
import Entry from "../sections/Entry";
import { useAuth } from "../context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";

const EntriesPage = () => {
  const [entries, setEntries] = useState([]);
  const [filterTag, setFilterTag] = useState(null);
  const { user } = useAuth();
  const [expandedEntry, setExpandedEntry] = useState(null);
  const entryRefs = useRef({}); // Stores references to each entry

  useEffect(() => {
    const fetchEntriesWithProfiles = async () => {
      const fetchedEntries = await getAllEntries(filterTag);

      console.log("📜 Firestore Fetched Entries:", fetchedEntries); // Debugging

      // Fetch profile pictures & trainer names
      const entriesWithProfiles = await Promise.all(
        fetchedEntries.map(async (entry) => {
          const userProfile = await getUserProfile(entry.authorId);

          return {
            ...entry,
            trainerName: entry.trainerName || "Anonymous Trainer",
            profilePicture: userProfile?.profilePicture || "/images/default-avatar.png",
          };
        })
      );

      console.log("✅ Processed Entries with Profile Pics:", entriesWithProfiles);
      setEntries(entriesWithProfiles);
    };

    fetchEntriesWithProfiles();
  }, [filterTag]);

  const handleToggleExpand = (entryId) => {
    // ✅ Close all others when opening a new one
    setExpandedEntry((prev) => (prev === entryId ? null : entryId));

    // ✅ Scroll to entry when expanded
    setTimeout(() => {
      if (entryRefs.current[entryId]) {
        entryRefs.current[entryId].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 300);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 mt-20 text-left">
      <h2 className="text-title mb-4">Research Log</h2>

      {/* Tag Filter */}
      <div className="flex gap-2 mb-6">
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

      {/* ✅ Masonry Grid Layout */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6"
        style={{ alignItems: "start" }}
      >
        <AnimatePresence>
          {entries.length > 0 ? (
            entries.map((entry) => (
              <motion.div
                key={entry.id}
                ref={(el) => (entryRefs.current[entry.id] = el)} // Assign reference to each entry
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Entry
                  {...entry}
                  currentUser={user}
                  isExpanded={expandedEntry === entry.id}
                  onToggleExpand={() => handleToggleExpand(entry.id)}
                />
              </motion.div>
            ))
          ) : (
            <p className="text-small text-gray-500 col-span-full text-center">
              No research entries found.
            </p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default EntriesPage;

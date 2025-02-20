import React, { useEffect, useState, useRef } from "react";
import { getAllEntries, getUserProfile } from "../firebase/FirebaseService";
import Entry from "../sections/Entry";
import { useAuth } from "../context/AuthContext";
import { useLocation, Link } from "react-router-dom";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { FaPencilAlt } from "react-icons/fa";
import Footer from "../sections/Footer";
import "../styles/HomePage.css";
import DynamicHeader from "../sections/DynamicHeader";
import tagsData from "../data/tags.json";

const EntriesPage = () => {
  const [entries, setEntries] = useState([]);
  const [filterTag, setFilterTag] = useState(null);
  const { user } = useAuth();
  const [expandedEntry, setExpandedEntry] = useState(null);
  const entryRefs = useRef({});
  const location = useLocation();
  const availableTags = ["All", ...tagsData.tags];

  useEffect(() => {
    const fetchEntriesWithProfiles = async () => {
      const fetchedEntries = await getAllEntries(filterTag);

      const entriesWithProfiles = await Promise.all(
        fetchedEntries.map(async (entry) => {
          const userProfile = await getUserProfile(entry.authorId);
          return {
            ...entry,
            trainerName: entry.trainerName || "Anonymous Trainer",
            profilePicture:
              userProfile?.profilePicture || "/images/default-avatar.png",
          };
        }),
      );

      setEntries(entriesWithProfiles);
    };

    fetchEntriesWithProfiles();
  }, [filterTag]);

  useEffect(() => {
    if (location.state?.openEntryId) {
      setExpandedEntry(location.state.openEntryId);

      setTimeout(() => {
        if (entryRefs.current[location.state.openEntryId]) {
          entryRefs.current[location.state.openEntryId].scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 300);
    }
  }, [entries, location.state]);

  return (
    <div className="home-container">
      <DynamicHeader />

      {/* ✅ Main Content Area */}
      <div className="main-content">
        {/* ✅ Lighter Container for Title & Tags */}
        <div className="w-full p-6 bg-[#ede3d5]">
          {/* ✅ Title + Log Entry Button */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-title">Research Log</h2>

            {user ? (
              <Link
                to="/create-entry"
                className="flex btn-secondary items-center"
              >
                <FaPencilAlt className="mr-2" />
                Log Entry
              </Link>
            ) : (
              <p className="text-sm text-textDark">
                Log in to create an entry!
              </p>
            )}
          </div>

          {/* ✅ Tag Filters */}
          <div className="flex gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag === "All" ? null : tag)}
                className={`px-4 py-2 rounded-lg text-sm font-bold ${
                  filterTag === tag || (tag === "All" && !filterTag)
                    ? "bg-accentGreen text-white"
                    : "bg-[#dbd4c1] text-textDark"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* ✅ Entries Container - Full Width */}
        <div className="max-w-8xl mx-auto px-6 mt-6">
          <ResponsiveMasonry
            columnsCountBreakPoints={{ 350: 2, 750: 3, 1024: 4 }}
          >
            <Masonry gutter="16px">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  ref={(el) => (entryRefs.current[entry.id] = el)}
                  className="w-full"
                >
                  <Entry
                    key={entry.id}
                    id={entry.id}
                    authorId={entry.authorId}
                    trainerName={entry.trainerName}
                    profilePicture={entry.profilePicture}
                    text={entry.text}
                    imageUrl={entry.imageUrl}
                    tags={entry.tags}
                    likes={entry.likes}
                    createdAt={entry.createdAt}
                    currentUser={user}
                    isExpanded={expandedEntry === entry.id}
                    onToggleExpand={() =>
                      setExpandedEntry(
                        expandedEntry === entry.id ? null : entry.id,
                      )
                    }
                    onDeleteEntry={(deletedId) =>
                      setEntries(entries.filter((e) => e.id !== deletedId))
                    }
                  />
                </div>
              ))}
            </Masonry>
          </ResponsiveMasonry>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EntriesPage;

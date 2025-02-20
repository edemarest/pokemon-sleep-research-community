import React, { useEffect, useState } from "react";
import { getEntries, getUserProfile } from "../firebase/FirebaseService";
import Entry from "../sections/Entry";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { FaPencilAlt } from "react-icons/fa";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import "../styles/ResearchEntries.css";

const ResearchEntries = () => {
  const [entries, setEntries] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEntriesWithProfiles = async () => {
      const fetchedEntries = await getEntries(6);
      const entriesWithProfilePics = await Promise.all(
        fetchedEntries.map(async (entry) => {
          const userProfile = await getUserProfile(entry.authorId);
          return {
            ...entry,
            trainerName: userProfile?.trainerName || "Unknown Trainer",
            profilePicture:
              userProfile?.profilePicture || "/images/default-avatar.png",
          };
        })
      );

      setEntries(entriesWithProfilePics);
    };

    fetchEntriesWithProfiles();
  }, []);

  // ✅ Delete handler to remove the entry from state
  const handleDeleteEntry = (deletedId) => {
    setEntries((prevEntries) =>
      prevEntries.filter((entry) => entry.id !== deletedId)
    );
  };

  const handleEntryClick = (entryId) => {
    navigate(`/entries`, { state: { openEntryId: entryId } });
  };

  return (
    <section className="research-entries">
      {/* ✅ Header + Buttons */}
      <div className="entries-header">
        <h2 className="text-title">Recent Entries</h2>

        {/* ✅ Buttons - Adjust Layout Based on Screen Size */}
        <div className={`entries-buttons ${user ? "user-logged-in" : "guest"}`}>
          <Link to="/entries" className="btn-primary inline-block">
            See All Entries
          </Link>
          {user && (
            <Link to="/create-entry" className="flex btn-secondary items-center">
              <FaPencilAlt className="mr-2" />
              Log Entry
            </Link>
          )}
        </div>
      </div>

      {/* ✅ Show message when not logged in */}
      {!user && (
        <p className="text-body text-textDark sign-in-message">
          Sign in to make an entry!
        </p>
      )}

      {/* ✅ Scrollable Container for Entries */}
      <div className="entries-container">
        {entries.length > 0 ? (
          <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 768: 2 }}>
            <Masonry gutter="16px">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="w-full"
                  onClick={() => handleEntryClick(entry.id)}
                >
                  <Entry
                    {...entry}
                    currentUser={user}
                    isPreview={true}
                    onDeleteEntry={handleDeleteEntry}
                  />
                </div>
              ))}
            </Masonry>
          </ResponsiveMasonry>
        ) : (
          <p className="text-small text-textDark">No research entries yet.</p>
        )}
      </div>
    </section>
  );
};

export default ResearchEntries;

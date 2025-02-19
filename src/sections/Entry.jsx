import React, { useState, useEffect } from "react";
import {
  toggleLike,
  getComments,
  addComment,
  getUserProfile,
  deleteEntry,
} from "../firebase/FirebaseService";
import { FaHeart, FaRegHeart, FaComment, FaTrash } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Comment from "./Comment";
import censoredWords from "../data/censored_words.json";

const DEFAULT_PFP = "/images/default-avatar.png";

const moderateText = (text) => {
  if (text.length < 1)
    return "Your comment must be at least 3 characters long.";
  if (text.length > 500) return "Your comment exceeds the 500-character limit.";

  const sanitizeText = (input) =>
    input
      .replace(/[^\w\s]|_/g, "")
      .replace(/\s+/g, " ")
      .trim();
  const cleanText = sanitizeText(text);

  for (const word of censoredWords) {
    const pattern = new RegExp(`\\b${word.match}\\b`, "gi");
    if (pattern.test(cleanText)) {
      return `Your comment contains inappropriate language.`;
    }
  }

  return null;
};

const Entry = ({
  id,
  authorId,
  trainerName,
  profilePicture,
  text,
  imageUrl,
  tags,
  likes,
  createdAt,
  currentUser,
  isExpanded,
  onToggleExpand,
  isPreview,
  onDeleteEntry,
}) => {
  const [liked, setLiked] = useState(likes.includes(currentUser?.uid));
  const [likeCount, setLikeCount] = useState(likes.length);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComment, setLoadingComment] = useState(false);
  const [error, setError] = useState("");
  const isAuthor = currentUser?.uid === authorId;
  const profilePicUrl = profilePicture || DEFAULT_PFP;
  const displayTrainerName = trainerName || "Anonymous Trainer";
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [likeError, setLikeError] = useState("");

  useEffect(() => {
    if (currentUser?.uid) {
      getUserProfile(currentUser.uid).then((profile) => {
        if (profile) {
          setCurrentUserProfile(profile);
        } else {
          console.warn("⚠️ No Firestore profile found for current user.");
        }
      });
    }
  }, [currentUser]);

  useEffect(() => {
    getComments(id).then(setComments);
  }, [id]);

  useEffect(() => {
    if (isExpanded) {
      getComments(id).then(setComments);
    }
  }, [isExpanded, id]);

  const handleLike = async (e) => {
    e.stopPropagation();

    if (!currentUser) {
      setLikeError("You must be logged in to like an entry!");
      return;
    }

    setLikeError("");

    const success = await toggleLike(id, currentUser.uid);
    if (success) {
      setLiked(!liked);
      setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    }
  };

  const handleAddComment = async (e) => {
    e.stopPropagation();
    if (!currentUser) {
      console.error("❌ No currentUser found when adding a comment.");
      return;
    }

    const moderationError = moderateText(newComment);
    if (moderationError) {
      setError(moderationError);
      return;
    }

    setLoadingComment(true);
    setError("");

    try {
      const trainerName =
        currentUserProfile?.trainerName ||
        currentUser?.displayName ||
        "Anonymous Trainer";

      const profilePic =
        currentUserProfile?.profilePicture ||
        currentUser?.photoURL ||
        DEFAULT_PFP;

      console.log("✅ Retrieved currentUser profile for comment:", {
        trainerName,
        profilePic,
      });

      const success = await addComment(
        id,
        currentUser.uid,
        trainerName,
        newComment,
        profilePic,
      );

      if (success) {
        setComments([
          ...comments,
          {
            trainerName,
            text: newComment,
            profilePicture: profilePic,
          },
        ]);
        setNewComment("");
      }
    } catch (error) {
      console.error("🔥 Error adding comment:", error);
    }

    setLoadingComment(false);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "Are you sure you want to delete this entry? This action cannot be undone.",
      )
    )
      return;

    const success = await deleteEntry(id, currentUser.uid, imageUrl);
    if (success) {
      console.log(`🗑️ Successfully deleted entry: ${id}`);
      onDeleteEntry(id); // ✅ Update state in parent
    } else {
      console.error("🔥 Failed to delete entry.");
    }
  };

  return (
    <motion.div
      layout
      className="bg-white p-4 rounded-lg shadow-md border border-accentGreen w-full cursor-pointer transition-all duration-300"
      onClick={() => {
        if (!isPreview) {
          onToggleExpand(id);
        }
      }}
      style={{
        minHeight: isExpanded ? "auto" : "fit-content",
        breakInside: "avoid",
      }}
    >
      {/* Top Section (Author Info & Delete Icon) */}
      <div className="flex justify-between items-center mb-2">
        {/* Author Info */}
        <div className="flex items-center text-left">
          <img
            src={profilePicUrl}
            alt={displayTrainerName}
            className="w-10 h-10 rounded-full border-2 border-textDark mr-3"
          />
          <div>
            <p className="text-label font-bold">{displayTrainerName}</p>
            <p className="text-small text-gray-500">
              {new Date(createdAt.seconds * 1000).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Delete Button (Only for Author) */}
        {isAuthor && (
          <button
            onClick={handleDelete}
            className="text-textDark hover:text-red-600 mb-auto"
          >
            <FaTrash />
          </button>
        )}
      </div>

      {text && <p className="text-body mb-3 text-left">{text}</p>}

      {imageUrl && (
        <motion.img
          src={imageUrl}
          alt="Entry"
          className="w-full h-auto object-cover rounded-lg mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        />
      )}

      <div className="flex gap-2 mb-3">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="bg-accentGreen text-white px-2 py-1 text-xs rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Like & Comment Icons */}
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className="flex items-center text-body prevent-collapse"
          >
            {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}{" "}
            <span className="ml-1">{likeCount}</span>
          </button>

          {/* Comment Button */}
          <button className="flex items-center text-body prevent-collapse">
            <FaComment /> <span className="ml-1">{comments.length}</span>
          </button>
        </div>

        {/* ✅ Display login message only when needed */}
        {likeError && <p className="text-red-600 text-sm">{likeError}</p>}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="mt-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-subtitle">Comments</p>
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <Comment
                  key={index}
                  profilePicture={comment.profilePicture}
                  trainerName={comment.trainerName}
                  text={comment.text}
                  commentId={comment.id}
                  entryId={id}
                  currentUserTrainerName={currentUserProfile?.trainerName} // ✅ Pass trainer name directly
                  onDeleteComment={(commentId) =>
                    setComments(comments.filter((c) => c.id !== commentId))
                  }
                />
              ))
            ) : (
              <p className="text-small text-gray-500">No comments yet.</p>
            )}
            {currentUser ? (
              <div className="flex flex-col border-t border-gray-300 pt-2 mt-2">
                <div className="flex items-center">
                  <img
                    src={
                      currentUserProfile?.profilePicture ||
                      currentUser?.photoURL ||
                      DEFAULT_PFP
                    }
                    alt="Current User"
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none prevent-collapse"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => {
                      setNewComment(e.target.value);
                      setError("");
                    }}
                  />
                  <button
                    className="ml-2 px-4 py-2 rounded-lg prevent-collapse bg-accentBlue text-white"
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || loadingComment}
                  >
                    {loadingComment ? "Posting..." : "Post"}
                  </button>
                </div>

                {/* ✅ Error message handling added back */}
                {error && (
                  <div className="bg-red-100 text-red-600 p-3 rounded-lg mt-2">
                    {error}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-small text-gray-500 mt-2">
                Log in to reply to this entry!
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Entry;

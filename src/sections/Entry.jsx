import React, { useState, useEffect } from "react";
import { toggleLike, getComments, addComment } from "../firebase/FirebaseService";
import { FaHeart, FaRegHeart, FaComment } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Comment from "./Comment";


const DEFAULT_PFP = "/images/default-avatar.png";

const Entry = ({ id, trainerName, profilePicture, text, imageUrl, tags, likes, createdAt, currentUser, isExpanded, onToggleExpand, entryRef }) => {
  const [liked, setLiked] = useState(likes.includes(currentUser?.uid));
  const [likeCount, setLikeCount] = useState(likes.length);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComment, setLoadingComment] = useState(false);

  const profilePicUrl = profilePicture || DEFAULT_PFP;
  const displayTrainerName = trainerName || "Anonymous Trainer";

  useEffect(() => {
    if (isExpanded) {
      getComments(id).then(setComments);
    }
  }, [isExpanded, id]);

  const handleLike = async () => {
    const success = await toggleLike(id, currentUser.uid);
    if (success) {
      setLiked(!liked);
      setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setLoadingComment(true);

    const success = await addComment(id, currentUser.uid, currentUser.displayName, newComment);
    if (success) {
      setComments([...comments, { trainerName: currentUser.displayName, text: newComment, profilePicture: currentUser.photoURL }]);
      setNewComment("");
    }

    setLoadingComment(false);
  };

  return (
    <motion.div
      layout
      className="bg-white p-4 rounded-lg shadow-md border border-accentGreen w-full cursor-pointer transition-all duration-300"
      onClick={onToggleExpand}
      style={{
        minHeight: isExpanded ? "auto" : "fit-content",
        breakInside: "avoid",
      }}
    >
      {/* Trainer Info */}
      <div className="flex items-center mb-2">
        <img src={profilePicUrl} alt={displayTrainerName} className="w-10 h-10 rounded-full border-2 border-textDark mr-3" />
        <div>
          <p className="text-label font-bold">{displayTrainerName}</p>
          <p className="text-small text-gray-500">{new Date(createdAt.seconds * 1000).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Entry Text */}
      {text && <p className="text-body mb-3">{text}</p>}

      {/* Entry Image */}
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

      {/* Tags */}
      <div className="flex gap-2 mb-3">
        {tags.map((tag, index) => (
          <span key={index} className="bg-accentGreen text-white px-2 py-1 text-xs rounded-full">
            {tag}
          </span>
        ))}
      </div>

      {/* Like & Comment Buttons */}
      <div className="flex items-center gap-4">
        <button onClick={handleLike} className="flex items-center text-body">
          {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />} <span className="ml-1">{likeCount}</span>
        </button>
        <button className="flex items-center text-body">
          <FaComment /> <span className="ml-1">{comments.length}</span>
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="mt-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-subtitle">Comments</p>
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <Comment
                  key={index}
                  profilePicture={comment.profilePicture}
                  trainerName={comment.trainerName}
                  text={comment.text}
                />
              ))
            ) : (
              <p className="text-small text-gray-500">No comments yet.</p>
            )}

            {/* ✅ Comment Input Section */}
            <div className="flex items-center border-t border-gray-300 pt-2 mt-2">
              <img
                src={currentUser?.photoURL || DEFAULT_PFP}
                alt="Current User"
                className="w-8 h-8 rounded-full mr-2"
              />
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onClick={(e) => e.stopPropagation()} // ✅ Prevents closing on click
              />
              <button
                className={`ml-2 px-4 py-2 rounded-lg ${newComment.trim() ? "bg-accentBlue text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                onClick={handleAddComment}
                disabled={!newComment.trim() || loadingComment}
              >
                {loadingComment ? "Posting..." : "Post"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Entry;

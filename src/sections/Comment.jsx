import React from "react";
import { deleteComment } from "../firebase/FirebaseService";
import { FaTrash } from "react-icons/fa";

const DEFAULT_PFP = "/images/default-avatar.png";

const Comment = ({
  profilePicture,
  trainerName,
  text,
  commentId,
  entryId,
  currentUserTrainerName,
  onDeleteComment,
}) => {
  const isAuthor = currentUserTrainerName === trainerName;
  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this comment? This action cannot be undone.",
      )
    )
      return;

    const success = await deleteComment(entryId, commentId);
    if (success) {
      onDeleteComment(commentId); // ✅ Instantly remove from UI
    } else {
      console.error("🔥 Failed to delete comment.");
    }
  };

  return (
    <div className="flex items-center justify-between border-b border-gray-300 py-2">
      <div className="flex items-center text-left">
        <img
          src={profilePicture || DEFAULT_PFP} // ✅ Ensure correct profile picture
          alt={trainerName || "Anonymous Trainer"} // ✅ Ensure correct trainer name
          className="w-8 h-8 rounded-full mr-2"
        />
        <div>
          <p className="text-small font-bold">
            {trainerName || "Anonymous Trainer"}
          </p>
          <p className="text-small">{text}</p>
        </div>
      </div>

      {/* Delete Button (Only for the comment author) */}
      {isAuthor && (
        <button
          onClick={handleDelete}
          className="text-textDark hover:text-red-600"
        >
          <FaTrash />
        </button>
      )}
    </div>
  );
};

export default Comment;

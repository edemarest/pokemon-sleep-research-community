import React from "react";

const DEFAULT_PFP = "/images/default-avatar.png";

const Comment = ({ profilePicture, trainerName, text }) => {
  const profilePicUrl = profilePicture || DEFAULT_PFP;
  const displayTrainerName = trainerName || "Anonymous Trainer";

  return (
    <div className="flex items-center border-b border-gray-300 py-2">
      <img src={profilePicUrl} alt={displayTrainerName} className="w-8 h-8 rounded-full mr-2" />
      <div>
        <p className="text-small font-bold">{displayTrainerName}</p>
        <p className="text-small">{text}</p>
      </div>
    </div>
  );
};

export default Comment;

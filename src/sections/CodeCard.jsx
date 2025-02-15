import React from "react";
import "../styles/FriendFinder.css";

const CodeCard = ({ trainer, isUser }) => {
  return (
    <div className={`friend-card ${isUser ? "user-card" : ""}`}>
      <p className="font-body">{trainer.trainerName}</p>
      <span className="friend-code">{trainer.friendCode}</span>
    </div>
  );
};

export default CodeCard;

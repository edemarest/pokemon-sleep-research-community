import React, { useState } from "react";
import { FaRegCopy, FaCheck } from "react-icons/fa"; // ✅ Import copy & checkmark icons
import "../styles/FriendFinder.css";

const DEFAULT_TRAINER_NAME = "Unknown Trainer";

const CodeCard = ({ trainer, isUser }) => {
  const [copied, setCopied] = useState(false); // ✅ State for copied message

  // ✅ Ensure trainer object is valid before rendering
  if (!trainer || !trainer.trainerName) {
    console.warn("⚠️ Invalid trainer object passed to CodeCard:", trainer);
    return null; // ✅ Prevents rendering a broken card
  }

  // ✅ Function to copy trainer code to clipboard
  const copyToClipboard = () => {
    if (trainer.friendCode) {
      navigator.clipboard.writeText(trainer.friendCode);
      setCopied(true);

      // ✅ Hide the message after 3 seconds
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div
      className={`friend-card ${isUser ? "user-card" : ""}`}
      onClick={copyToClipboard}
      style={{ cursor: trainer.friendCode ? "pointer" : "default" }}
    >
      <p className="font-body">{trainer.trainerName || DEFAULT_TRAINER_NAME}</p>

      {/* ✅ Friend Code Section */}
      <div
        className="friend-code-container"
        style={{ display: "flex", alignItems: "center", position: "relative" }}
      >
        {trainer.friendCode ? (
          <>
            {/* ✅ Copied Message (Fades Out) */}
            {copied && (
              <span
                className="copied-message"
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginRight: "8px",
                  color: "#4CAF50", // ✅ Green checkmark color
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  transition: "opacity 0.8s ease-in-out",
                }}
              >
                <FaCheck style={{ marginRight: "5px" }} /> Copied!
              </span>
            )}

            <span className="friend-code" style={{ marginRight: "8px" }}>
              {trainer.friendCode}
            </span>
            <FaRegCopy className="copy-icon" />
          </>
        ) : (
          <span className="friend-code text-gray-500">
            No Friend Code Available
          </span>
        )}
      </div>
    </div>
  );
};

export default CodeCard;

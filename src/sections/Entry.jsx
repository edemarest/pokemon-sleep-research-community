import React, { useState, useEffect } from "react";
import { toggleLike, getComments, addComment } from "../firebase/FirebaseService";
import { FaHeart, FaRegHeart, FaComment } from "react-icons/fa";

const Entry = ({ id, trainerName, profilePicture, text, imageUrl, tags, likes, createdAt, currentUser }) => {
  const [liked, setLiked] = useState(likes.includes(currentUser?.uid));
  const [likeCount, setLikeCount] = useState(likes.length);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [expanded, setExpanded] = useState(false);

  // Fetch comments when expanded
  useEffect(() => {
    if (expanded) {
      getComments(id).then(setComments);
    }
  }, [expanded, id]);

  // Handle like toggle
  const handleLike = async () => {
    const success = await toggleLike(id, currentUser.uid);
    if (success) {
      setLiked(!liked);
      setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    }
  };

  // Handle adding a comment
  const handleAddComment = async () => {
    if (newComment.trim() === "") return;
    
    const commentData = {
      authorId: currentUser.uid,
      trainerName: currentUser.displayName,
      text: newComment,
    };

    const success = await addComment(id, currentUser.uid, currentUser.displayName, newComment);
    if (success) {
      setComments([...comments, commentData]);
      setNewComment("");
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-accentGreen">
      {/* Trainer Info */}
      <div className="flex items-center mb-3">
        <img src={profilePicture} alt={trainerName} className="w-10 h-10 rounded-full border-2 border-textDark mr-3" />
        <div>
          <p className="text-title">{trainerName}</p>
          <p className="text-small text-gray-500">{new Date(createdAt.seconds * 1000).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Entry Text */}
      <p className="text-body mb-3">{text}</p>

      {/* Entry Image (if available) */}
      {imageUrl && <img src={imageUrl} alt="Entry" className="w-full h-60 object-cover rounded-lg mb-3" />}

      {/* Tags */}
      <div className="flex gap-2 mb-3">
        {tags.map((tag, index) => (
          <span key={index} className="bg-accentGreen text-white px-2 py-1 text-xs rounded-full">{tag}</span>
        ))}
      </div>

      {/* Like & Comment Buttons */}
      <div className="flex items-center gap-4">
        <button onClick={handleLike} className="flex items-center text-body">
          {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />} <span className="ml-1">{likeCount}</span>
        </button>
        <button onClick={() => setExpanded(!expanded)} className="flex items-center text-body">
          <FaComment /> <span className="ml-1">{comments.length}</span>
        </button>
      </div>

      {/* Comments Section */}
      {expanded && (
        <div className="mt-4">
          <p className="text-subtitle">Comments</p>
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <div key={index} className="border-b border-gray-300 py-2">
                <p className="text-small font-bold">{comment.trainerName}</p>
                <p className="text-small">{comment.text}</p>
              </div>
            ))
          ) : (
            <p className="text-small text-gray-500">No comments yet.</p>
          )}

          {/* Add Comment Input */}
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="form-input flex-grow"
            />
            <button onClick={handleAddComment} className="btn-primary">Post</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Entry;

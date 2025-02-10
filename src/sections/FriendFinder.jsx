import React from "react";
import "../styles/FriendFinder.css";

const FriendFinder = () => {
  const friends = [
    { id: 1, name: "Trainer Ash", code: "1234-5678-9012" },
    { id: 2, name: "Trainer Misty", code: "2345-6789-0123" },
    { id: 3, name: "Trainer Brock", code: "3456-7890-1234" },
  ];

  return (
    <section className="friend-finder w-full max-w-3xl p-4">
      <h2 className="text-2xl font-title mb-3">Looking for Friends</h2>
      <div className="friend-list">
        {friends.map((friend) => (
          <div key={friend.id} className="friend-card">
            <p className="font-body">{friend.name}</p>
            <span className="friend-code">{friend.code}</span>
          </div>
        ))}
      </div>
      <button className="bg-accentBlue text-white font-body px-4 py-2 rounded-md mt-3">
        Add Your Code
      </button>
    </section>
  );
};

export default FriendFinder;

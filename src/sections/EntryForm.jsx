import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveEntry, uploadEntryImage, getUserProfile } from "../firebase/FirebaseService";
import { useAuth } from "../context/AuthContext";
import { FaPaperclip } from "react-icons/fa"; // ✅ Import paperclip icon

const EntryForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State variables
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const availableTags = ["General", "Q&A", "Brags", "Fails"];

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError(true);
      return;
    }

    setLoading(true);
    let imageUrl = null;

    if (image) {
      imageUrl = await uploadEntryImage(user.uid, image);
    }

    // ✅ Fetch user profile to get trainerName
    const userProfile = await getUserProfile(user.uid);
    const trainerName = userProfile?.trainerName || "Unknown Trainer"; // ✅ Always fallback

    console.log("📜 Saving Entry:", {
      userId: user.uid,
      trainerName, // ✅ Debugging trainerName
      text,
      imageUrl,
      tags,
    });

    const success = await saveEntry(
      user.uid,
      trainerName, // ✅ Ensuring correct trainer name is passed
      text,
      imageUrl,
      tags.length ? tags : ["General"]
    );

    if (success) {
      navigate("/entries"); // Redirect to Entries page
    } else {
      alert("Failed to create entry. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-card rounded-lg shadow-md mt-24"> {/* ✅ Added margin-top */}
      {/* Title */}
      <h2 className="text-title mb-2 text-left">New Research Log</h2>

      {/* Body Text */}
      <p className="text-body mb-1 text-left">What would you like to write?  Feel free to log a lucky find, ask a question, or simply discuss the game!</p> {/* ✅ Left-aligned */}

      {/* Note */}
      <p className="text-small text-textDark mb-4 text-left"> {/* ✅ Left-aligned */}
        <span className="text-textDark">Note: Be respectful! Inappropriate logs will be filtered and removed.</span>
      </p>

      {/* Tag Selection */}
      <div className="mb-4 text-left"> {/* ✅ Left-aligned */}
        <label className="form-label">Select Tags</label>
        <div className="flex gap-2 flex-wrap pt-3">
          {availableTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`px-4 py-2 rounded-lg text-sm ${tags.includes(tag) ? "bg-accentBlue text-white" : "bg-gray-200 text-gray-700"
                }`}
              onClick={() =>
                setTags(tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag])
              }
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Hidden Error Message */}
      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-3">
          You must write something first!
        </div>
      )}

      {/* Entry Form */}
      <form onSubmit={handleSubmit} className="flex gap-4">
        {/* Text Area */}
        <textarea
          className="form-input h-40 w-2/3 resize-none border border-green-500 rounded-lg p-2"
          placeholder="Write your entry..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError(false); // Hide error on typing
          }}
        />

        {/* Image Upload Section */}
        <label
          className="w-1/3 h-40 bg-background border-dashed border-2 border-yellow-800 text-brown-600 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer"
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
          ) : (
            <>
              <FaPaperclip className="text-3xl mb-1" /> {/* ✅ Large Paperclip Icon */}
              Attach Image
            </>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </label>
      </form>

      {/* Submit Button */}
      <button
        type="submit"
        className={`w-full mt-4 ${text.trim() ? "btn-primary" : "btn-disabled"
          }`}
        disabled={!text.trim() || loading}
        onClick={handleSubmit}
      >
        {loading ? "Publishing..." : "Publish Entry"}
      </button>
    </div>
  );
};

export default EntryForm;

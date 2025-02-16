import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveEntry, uploadEntryImage } from "../firebase/FirebaseService";
import { useAuth } from "../context/AuthContext";

const EntryForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State variables
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
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
    if (!text.trim()) return;

    setLoading(true);
    let imageUrl = null;

    if (image) {
      imageUrl = await uploadEntryImage(user.uid, image);
    }

    const success = await saveEntry(user.uid, user.displayName, text, imageUrl, tags.length ? tags : ["General"]);
    
    if (success) {
      navigate("/entries"); // Redirect to Entries page
    } else {
      alert("Failed to create entry. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-card rounded-lg shadow-md">
      <h2 className="text-title mb-4">Create New Entry</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Entry Text */}
        <textarea
          className="form-input h-32 resize-none"
          placeholder="Write your entry..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />

        {/* Image Upload */}
        <div className="flex flex-col items-center">
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-40 object-cover rounded-lg mb-2"
            />
          )}
          <label className="btn-secondary cursor-pointer">
            Upload Image
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>

        {/* Tag Selection */}
        <div>
          <label className="form-label">Select Tags</label>
          <div className="flex gap-2 flex-wrap">
            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`px-4 py-2 rounded-lg text-sm ${
                  tags.includes(tag) ? "bg-accentBlue text-white" : "bg-gray-200 text-gray-700"
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

        {/* Submit Button */}
        <button type="submit" className="btn-primary w-full" disabled={loading || !text.trim()}>
          {loading ? "Publishing..." : "Publish Entry"}
        </button>
      </form>
    </div>
  );
};

export default EntryForm;

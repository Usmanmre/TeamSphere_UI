import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const TaskModal = ({ isOpen, onClose, onSubmit }) => {
  const [emails, setEmails] = useState([]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const modalRef = useRef(null);

  const handleChange = (e) => {
    setError(""); // Clear error message after successful addition

    setEmail(e.target.value);
  }

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // Simple regex for email validation
  };

  const handleAddEmail = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email cannot be empty.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (emails.includes(email)) {
      setError("This email is already added.");
      return;
    }

    setEmails([...emails, email]);
    setEmail("");
    setError(""); // Clear error message after successful addition
  };

  const handleRemoveEmail = (index) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(emails);
    setEmails([]);
    onClose();
  };

  // Handle click outside to close the modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-[9999]">
      <motion.div
        ref={modalRef} // Attach ref here to detect clicks outside
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className="relative bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 w-full max-w-md"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white hover:text-gray-300 transition"
        >
          <X size={20} />
        </button>

        {/* Modal Title */}
        <h2 className="text-xl font-bold text-white mb-4 text-center">
          Create Team
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Chips */}
          <div className="flex flex-wrap gap-2">
            {emails.map((email, index) => (
              <div
                key={index}
                className="flex items-center bg-yellow-500 text-black px-3 py-1 rounded-full shadow-md"
              >
                <span className="text-sm">{email}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveEmail(index)}
                  className="ml-2 text-black hover:text-gray-800"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={handleChange}
              placeholder="Enter email and press Add"
              className="w-full px-4 py-2 rounded-lg border border-white/30 bg-white/10 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none placeholder:text-white/50"
            />
            <button
              onClick={handleAddEmail}
              className="mt-2 w-full px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-600 transition"
            >
              Add
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}

          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={emails.length === 0} // Disables if emails array is empty
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                emails.length
                  ? "bg-yellow-500 text-black hover:bg-yellow-600"
                  : "bg-gray-400 text-gray-700 cursor-not-allowed"
              }`}
            >
              Save
            </button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body // Ensure modal is rendered at the root level
  );
};

export default TaskModal;

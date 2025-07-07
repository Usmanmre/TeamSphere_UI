import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, Users, Mail, Plus, UserPlus } from "lucide-react";

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
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[9999] p-4">
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl w-full max-w-lg rounded-3xl border border-gray-700/50 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 border-b border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 rounded-xl">
                <UserPlus className="text-blue-400" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Create Team
                </h2>
                <p className="text-gray-400 text-sm">
                  Add team members to collaborate
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700/50 rounded-xl transition-colors duration-200 group"
            >
              <X size={24} className="text-gray-400 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Email Input Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300 flex items-center gap-2">
                <Mail className="text-blue-400" size={16} />
                Add Team Member
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={handleChange}
                  placeholder="Enter email address..."
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-600 bg-gray-800/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 placeholder-gray-500 text-white"
                />
                <button
                  type="button"
                  onClick={handleAddEmail}
                  className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-blue-600/25 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                  <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                  {error}
                </div>
              )}
            </div>

            {/* Email Chips */}
            {emails.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="text-green-400" size={16} />
                  <span className="text-sm font-semibold text-gray-300">
                    Team Members ({emails.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {emails.map((email, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-300 px-3 py-2 rounded-xl border border-green-500/30 shadow-lg hover:shadow-green-500/25 transition-all duration-200 group"
                    >
                      <Mail className="text-green-400 mr-2" size={14} />
                      <span className="text-sm font-medium">{email}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEmail(index)}
                        className="ml-2 p-1 hover:bg-red-500/20 rounded-lg transition-colors duration-200 group-hover:text-red-400"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Info Section */}
          {emails.length === 0 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="text-blue-400" size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-300">No team members added</h3>
                  <p className="text-xs text-blue-400/70">Add email addresses above to create your team</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-700/50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={emails.length === 0}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform ${
                emails.length > 0
                  ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-green-600/25 hover:scale-105"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              Create Team ({emails.length})
            </button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  );
};

export default TaskModal;

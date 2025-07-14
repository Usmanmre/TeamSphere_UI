import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import BASE_URL from "../config";
import toast from "react-hot-toast";

const DonationModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { title: "", description: "", amount: 0 },
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const sendData = async (data) => {
    try {
      let token = localStorage.getItem("token");
  
      if (!token) {
        toast.error("No token found.");
        return;
      }
  
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`, // No extra space
        },
        withCredentials: true,
      };
  
      let response;
  
      try {
        response = await axios.post(
          `${BASE_URL}/api/donations/create/donation-pool`,
          data,
          config
        );
      } catch (err) {
        if (err.response?.status === 401) {
          // Token expired, attempt refresh
          const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh-token`, {
            method: "POST",
            credentials: "include", // for httpOnly cookie
          });
  
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            const newToken = refreshData.accessToken;
            localStorage.setItem("token", newToken);
  
            // Retry original request with new token
            response = await axios.post(
              `${BASE_URL}/api/donations/create/donation-pool`,
              data,
              {
                ...config,
                headers: {
                  ...config.headers,
                  Authorization: `${newToken}`,
                },
              }
            );
          } else {
            toast.error("Session expired. Please log in again.");
            return;
          }
        } else {
          throw err; // Other error
        }
      }
  
      console.log("response", response);
      toast.success("Donation created successfully!");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Something went wrong.");
    }
  };
  
  const onSubmit = (data) => {
    sendData(data);
    onClose();
    reset();
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 40 }}
          transition={{ duration: 0.2 }}
          ref={modalRef}
          className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl w-full max-w-md rounded-3xl border border-gray-700/50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-pink-500/30 via-yellow-500/20 to-pink-500/30 border-b border-gray-700/50">
            <h2 className="text-2xl font-bold tracking-tight">
              Call for Donation
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700/50 rounded-xl transition-colors duration-200 group"
            >
              <X
                size={22}
                className="text-gray-400 group-hover:text-white transition-colors"
              />
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300">
                Title
              </label>
              <input
                type="text"
                {...register("title", { required: "Title is required" })}
                placeholder="Donation Title"
                className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-800/50 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:outline-none transition-all duration-200 placeholder-gray-500 text-white"
              />
              {errors.title && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300">
                Description
              </label>
              <textarea
                {...register("description", {
                  required: "Description is required",
                })}
                placeholder="Describe the purpose of the donation..."
                className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-800/50 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none transition-all duration-200 placeholder-gray-500 text-white resize-none"
                rows={3}
              />
              {errors.description && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300">
                amount Raised
              </label>
              <input
                type="number"
                min="0"
                {...register("amount", {
                  required: "amount raised is required",
                  min: { value: 0, message: "Amount must be at least 0" },
                  valueAsNumber: true,
                })}
                placeholder="Amount Raised (USD)"
                className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-800/50 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none transition-all duration-200 placeholder-gray-500 text-white"
              />
              {errors.amount && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.amount.message}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-700/50">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  reset();
                }}
                className="px-6 py-3 rounded-xl bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 text-white font-semibold shadow-lg hover:shadow-pink-500/25 transition-all duration-300 transform hover:scale-105"
              >
                Submit
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default DonationModal;

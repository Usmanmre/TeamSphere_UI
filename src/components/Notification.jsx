import React, { useEffect, useState, useRef } from "react";
import socket from "../socket";
import toast from "react-hot-toast";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BASE_URL from "../../config"; 

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    getAllNotifications();

    socket.on("notification", (message) => {
      console.log("New Notification:", message);
      toast.success(
        `🔔 New Task: ${message?.message} on board ${message?.title}`
      );
      setNotifications((prev) => [message, ...prev]);
    });

    return () => {
      socket.off("notification");
    };
  }, []);

  useEffect(() => {
    if (open) {
      updateNotificationFlag();
      markAllAsRead();
    }
  }, [open]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((noti) => ({ ...noti, isRead: true })));
  };

  const getAllNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return console.error("No token found. Please log in.");

      const response = await fetch(
        `${BASE_URL}/api/notification/all`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: ` ${token}`,
          },
        }
      );

      if (!response.ok) return console.error("Error getting notifications");

      const result = await response.json();
      setNotifications(result || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const updateNotificationFlag = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${BASE_URL}/api/notification/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: ` ${token}`,
        },
      });
    } catch (err) {
      console.error("Error updating notification status:", err);
    }
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((noti) => !noti.isRead).length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-all duration-300"
      >
        <Bell size={24} className="text-white" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full"
          >
            {unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-72 bg-white/10  border border-gray-700 shadow-xl rounded-xl overflow-hidden z-50"
          >
            <ul className="max-h-64 overflow-y-auto divide-y divide-gray-700">
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <li
                    key={index}
                    className="p-3 hover:bg-gray-700 transition-all duration-200 cursor-pointer"
                  >
                    <p className="text-white">
                      {notification?.message}{" "}
                      <span className="text-xs opacity-75">on board:</span>{" "}
                      {notification?.boardName}
                    </p>

                    <p className="text-xs text-gray-400">
                      Assigned By:{" "}
                      <span className="font-medium">
                        {notification?.createdBy}
                      </span>
                    </p>
                  </li>
                ))
              ) : (
                <li className="p-4 text-center text-gray-300">
                  No new notifications
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notification;

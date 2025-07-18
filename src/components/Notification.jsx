import React, { useEffect, useState, useRef } from "react";
import socket from "../socket";
import toast from "react-hot-toast";
import { Bell, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BASE_URL from "../config";
import { useTasks } from "../Global_State/TaskContext";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { getAllTasks } = useTasks();

  useEffect(() => {
    getAllNotifications();
    socket.on("notification", (message) => {
      toast.success(
        `🔔 New Task: ${message?.message} on board ${message?.boardName}`
      );
      setNotifications((prev) => [message, ...prev]);
      getAllTasks();
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

      const response = await fetch(`${BASE_URL}/api/notification/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: ` ${token}`,
        },
      });

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
    <div className="relative z-[9999]" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-3 rounded-full bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 hover:bg-gray-700 transition-all duration-300 shadow-lg"
      >
        <Bell size={22} className="text-white" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow"
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
            className="absolute right-0 mt-3 w-80 bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-xl border border-gray-700/60 shadow-2xl rounded-2xl overflow-hidden z-[9999]"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-blue-700/40 via-purple-700/40 to-blue-700/40 border-b border-gray-700/50">
              <Bell size={18} className="text-blue-400" />
              <span className="text-white font-semibold text-lg">Notifications</span>
              {unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  {unreadCount} new
                </span>
              )}
            </div>
            <ul className="max-h-80 overflow-y-auto divide-y divide-gray-800">
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      if (notification.isUpdated) {
                        window.location.href = `/board/${notification.boardId}`;
                      }
                    }}
                    className={`p-4 transition-all duration-200 cursor-pointer group rounded-none ${
                      !notification.isRead
                        ? "bg-blue-900/30 border-l-4 border-blue-500"
                        : "hover:bg-gray-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                      )}
                      <span className="text-white font-medium">
                        {notification?.message}
                      </span>
                      {notification?.isUpdated && (
                        <CheckCircle className="text-green-400 ml-2" size={16} />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>on board:</span>
                      <span className="text-blue-300 font-semibold">{notification?.boardName}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Assigned By: <span className="font-medium text-gray-300">{notification?.createdBy}</span>
                    </div>
                  </li>
                ))
              ) : (
                <li className="p-6 text-center text-gray-400 text-sm">
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

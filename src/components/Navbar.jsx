import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../Global_State/AuthContext";
import Dropdown from "./Dropdown";
import { Menu, LogOut, UserPlus, User, Settings, Bell } from "lucide-react";
import { useAppReset } from "../Global_State/ResetContext";

import Notification from "./Notification";
import AddPeopleModal from "./AddPeopleModal";
import { useBoard } from "../Global_State/BoardsContext";
import { useTasks } from "../Global_State/TaskContext";
import toast from "react-hot-toast";
import BASE_URL from "../config";
import { FaPlus } from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  const { getAllBoards, myBoards } = useBoard();
  const { getTeam } = useTasks();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const resetApp = useAppReset();

  const handleLogout = () => {
    logout();
    resetApp();
    navigate("/");
  };

  useEffect(() => {
    getAllBoards();
    getTeam();
  }, []);

  const addTeam = async (teamMembers) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/auth/addTeam`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: ` ${token}`,
        },
        body: JSON.stringify(teamMembers),
      });

      if (response.ok) {
        const msg = await response.json();
        toast.success(msg?.message);
      }
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="w-full h-16 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50 shadow-xl backdrop-blur-xl">
      <div className="h-full  mx-auto px-6 flex items-center justify-between">
        {/* Left Section - Welcome + Dropdown */}
        <div className="flex items-center gap-8">
          {/* Welcome Message */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">
                {auth?.user?.name?.[0]?.toUpperCase() || "G"}
              </span>
            </div>
            <div>
              <h1 className="text-white font-semibold text-lg">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">{auth?.user?.name || "Guest"}</span>
              </h1>
              <p className="text-gray-400 text-xs capitalize">{auth?.user?.role || "user"}</p>
            </div>
          </div>

          {/* Board Dropdown */}
          {auth?.user?.role !== "hr" && (
            <div className="hidden md:block">
              <Dropdown myBoards={myBoards} />
            </div>
          )}
        </div>

        {/* Center Section - Role Badge */}
        <div className="hidden lg:flex items-center">
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full px-4 py-2">
            <span className="text-blue-300 text-sm font-medium capitalize">
              {auth?.user?.role === "manager" ? "Team Manager" : 
               auth?.user?.role === "hr" ? "HR Manager" : "Team Member"}
            </span>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-4">
          {/* Add Team Button (Manager Only) */}
          {auth?.user?.role === "manager" && (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-purple-600/25 transition-all duration-300 transform hover:scale-105 font-medium"
            >
              <UserPlus size={18} />
              <span>Add Team</span>
            </button>
          )}

          {/* Post Job Button (HR Only) */}
          {auth?.user?.role === "hr" && (
            <button
              onClick={() => navigate("/job-form")}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-blue-600/25 transition-all duration-300 transform hover:scale-105 font-medium"
            >
              <FaPlus size={16} />
              <span>Post Job</span>
            </button>
          )}

          {/* Notifications */}
          <div className="relative">
            <Notification />
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/50 rounded-xl px-3 py-2 transition-all duration-200 group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-semibold text-sm">
                  {auth?.user?.name?.[0]?.toUpperCase() || "G"}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-white text-sm font-medium">{auth?.user?.name}</p>
                <p className="text-gray-400 text-xs">{auth?.user?.email}</p>
              </div>
              <div className="w-4 h-4 border-2 border-gray-400 rounded-full border-t-transparent animate-spin opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div
                className="absolute right-0 mt-3 w-64 bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 shadow-2xl rounded-2xl overflow-hidden z-50"
                ref={dropdownRef}
              >
                {/* User Info Header */}
                <div className="p-4 border-b border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {auth?.user?.name?.[0]?.toUpperCase() || "G"}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{auth?.user?.name}</p>
                      <p className="text-gray-400 text-sm">{auth?.user?.email}</p>
                      <p className="text-blue-400 text-xs font-medium capitalize">{auth?.user?.role}</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <button className="flex items-center gap-3 w-full px-4 py-3 text-gray-300 hover:bg-gray-700/50 rounded-xl transition-colors duration-200 group">
                    <User size={18} className="text-blue-400 group-hover:text-blue-300" />
                    <span>Profile Settings</span>
                  </button>
                  
                  <button className="flex items-center gap-3 w-full px-4 py-3 text-gray-300 hover:bg-gray-700/50 rounded-xl transition-colors duration-200 group">
                    <Settings size={18} className="text-green-400 group-hover:text-green-300" />
                    <span>Preferences</span>
                  </button>
                  
                  <div className="border-t border-gray-700/50 my-2"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors duration-200 group"
                  >
                    <LogOut size={18} className="group-hover:text-red-300" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add People Modal */}
      <AddPeopleModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={addTeam}
      />
    </nav>
  );
};

export default Navbar;

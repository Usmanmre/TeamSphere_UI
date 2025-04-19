import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../Global_State/AuthContext";
import Dropdown from "./Dropdown";
import { Menu, LogOut, UserPlus, User } from "lucide-react";

import Notification from "./Notification";
import AddPeopleModal from "./AddPeopleModal";
import { useBoard } from "../Global_State/BoardsContext";
import toast from "react-hot-toast";
import BASE_URL from "../config";

const Navbar = () => {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  const { getAllBoards, myBoards, currentBoard } = useBoard();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    getAllBoards();
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
    <nav
      className="w-full h-16 flex items-center justify-between px-8 shadow-lg backdrop-blur-lg border-b border-white/10"
      style={{
        background:
          "linear-gradient(135deg, rgba(36,37,42,0.85), rgba(23,23,28,0.9))",
      }}
    >
      {/* Left Section - Welcome + Dropdown */}
      <div className="flex items-center space-x-6">
        <h1 className="text-white font-semibold text-xl tracking-wide">
          Welcome,{" "}
          <span className="text-purple-400">{auth?.user?.name || "Guest"}</span>
        </h1>

        <div className="w-64">
          <Dropdown myBoards={myBoards} />
        </div>
      </div>

      {/* Right Section - Buttons */}
      <div className="flex items-center space-x-4">
        {/* Add Team Button (Manager Only) */}
        {auth?.user?.role === "manager" && (
          <button
            onClick={() => setModalOpen(true)}
            className="relative flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-500 text-white px-4 py-2 rounded-lg shadow-lg hover:scale-105 hover:shadow-purple-600/50 transition-transform duration-200"
          >
            <UserPlus size={20} />
            <span className="ml-2 font-medium">Add Team</span>
          </button>
        )}

        {/* Notifications */}
        <Notification />

        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition"
          >
            {auth?.user?.name[0]}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden" ref={dropdownRef}>
              <button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-gray-700">
                <User size={16} />
                Profile
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-gray-700" >
            <LogOut size={16} />
            Logout
          </button>
            </div>
          )}
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

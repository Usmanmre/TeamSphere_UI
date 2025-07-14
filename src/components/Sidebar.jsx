import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../Global_State/AuthContext";
import { useNavigate } from "react-router";
import { FiHome, FiPlusCircle } from "react-icons/fi";
import { HiOutlineMenuAlt3 } from "react-icons/hi";
import { X, Grid3X3, Settings, Users, Gift } from "lucide-react";

import BASE_URL from "../config";
import toast from "react-hot-toast";
import logotype from '../assets/logotype.png'
import icon from '../assets/Icon.png'

const Sidebar = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("home");
  const [open, setOpen] = useState(false);
  const [boardData, setBoardData] = useState({ title: "" });
  const modalRef = useRef(null);

  const handleHome = () => {
    setSelected("home");
    navigate("/board");
  };

  const openBoards = () => setOpen(true);
  const closeBoards = () => setOpen(false);

  const handleBoardChange = (e) => {
    setBoardData({ ...boardData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, setOpen]);

  const createBoard = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please log in.");

    const response = await fetch(`${BASE_URL}/api/board/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify(boardData),
    });

    const res = await response.json();
    if (response.status === 201) {
      toast.success(res.message);
      setBoardData({ title: "" });
      closeBoards();
      navigate("/board");
      window.location.reload();
    } else if (response.status === 400) {
      toast.error(res.message);
    } else {
      console.error("Failed to create board");
    }
  };

  return (
    <aside
      className={`h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      } shadow-2xl border-r border-gray-700/50 relative overflow-hidden`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-blue-500/20"></div>
      </div>

      {/* Collapse/Expand Button */}
      <button
        className="absolute top-4 right-4 p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all duration-200 group z-10"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <HiOutlineMenuAlt3 
          size={20} 
          className="text-gray-400 group-hover:text-white transition-colors" 
        />
      </button>

      {/* Sidebar Header */}
      <div className={`p-6 ${isCollapsed ? "text-center" : "text-left"} relative z-10`}>
        <div className="flex items-center gap-3">
          <div className="p-2    border-blue-500/30">
            {isCollapsed ? (
              <img className="h-6 w-6" src={icon} alt="Icon" />
            ) : (
              <img className="h-8" src={logotype} alt="Logotype" />
            )}
          </div>
         
        </div>
      </div>

      {/* Menu Items */}
      <nav className="mt-8 space-y-2 px-4 relative z-10">
        {/* Create Board (Manager Only) */}
        {auth?.user?.role === "manager" && (
          <div
            className={`flex items-center gap-3 p-3 cursor-pointer rounded-xl transition-all duration-200 group ${
              isCollapsed ? "justify-center" : ""
            } bg-gradient-to-r from-green-500/10 to-green-600/10 hover:from-green-500/20 hover:to-green-600/20 border border-green-500/20 hover:border-green-500/40`}
            onClick={openBoards}
          >
            <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
              <FiPlusCircle size={18} className="text-green-400" />
            </div>
            {!isCollapsed && (
              <span className="text-green-300 font-medium">Create Board</span>
            )}
          </div>
        )}
        
        {/* Home Navigation */}
        <div
          className={`flex items-center gap-3 p-3 cursor-pointer rounded-xl transition-all duration-200 group ${
            isCollapsed ? "justify-center" : ""
          } ${
            selected === "home" 
              ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-300" 
              : "hover:bg-gray-800/50 text-gray-300 hover:text-white"
          }`}
          onClick={handleHome}
        >
          <div className={`p-2 rounded-lg transition-colors ${
            selected === "home" 
              ? "bg-blue-500/20" 
              : "bg-gray-700/50 group-hover:bg-gray-600/50"
          }`}>
            <FiHome size={18} className={selected === "home" ? "text-blue-400" : "text-gray-400 group-hover:text-white"} />
          </div>
          {!isCollapsed && (
            <span className="font-medium">Home</span>
          )}
        </div>

        {/* Additional Menu Items */}
        <div className="pt-4 border-t border-gray-700/50">
          <div className={`flex items-center gap-3 p-3 cursor-pointer rounded-xl transition-all duration-200 group ${
            isCollapsed ? "justify-center" : ""
          } hover:bg-gray-800/50 text-gray-300 hover:text-white`}>
            <div className="p-2 bg-gray-700/50 group-hover:bg-gray-600/50 rounded-lg transition-colors">
              <Grid3X3 size={18} className="text-gray-400 group-hover:text-white" />
            </div>
            {!isCollapsed && (
              <span className="font-medium">Boards</span>
            )}
          </div>

          <div className={`flex items-center gap-3 p-3 cursor-pointer rounded-xl transition-all duration-200 group ${
            isCollapsed ? "justify-center" : ""
          } hover:bg-gray-800/50 text-gray-300 hover:text-white`}>
            <div className="p-2 bg-gray-700/50 group-hover:bg-gray-600/50 rounded-lg transition-colors">
              <Users size={18} className="text-gray-400 group-hover:text-white" />
            </div>
            {!isCollapsed && (
              <span className="font-medium">Team</span>
            )}
          </div>

          <div className={`flex items-center gap-3 p-3 cursor-pointer rounded-xl transition-all duration-200 group ${
            isCollapsed ? "justify-center" : ""
          } hover:bg-gray-800/50 text-gray-300 hover:text-white`}>
            <div className="p-2 bg-gray-700/50 group-hover:bg-gray-600/50 rounded-lg transition-colors">
              <Settings size={18} className="text-gray-400 group-hover:text-white" />
            </div>
            {!isCollapsed && (
              <span className="font-medium">Settings</span>
            )}
          </div>

          {auth?.user?.role !== "hr"  && (
            <div
              className={`flex items-center gap-3 p-3 cursor-pointer rounded-xl transition-all duration-200 group ${
                isCollapsed ? "justify-center" : ""
              } hover:bg-gray-800/50 text-pink-300 hover:text-white`}
              onClick={() => navigate("/donation-pools")}
            >
              <div className="p-2 bg-pink-500/20 group-hover:bg-pink-500/30 rounded-lg transition-colors">
                <Gift size={18} className="text-pink-400 group-hover:text-white" />
              </div>
              {!isCollapsed && <span className="font-medium">Donation Pools</span>}
            </div>
          )}
        </div>
      </nav>



      {/* Modal for Creating Board */}
      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md">
            <div
              ref={modalRef}
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl w-full rounded-3xl border border-gray-700/50 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-600/20 via-green-500/20 to-green-600/20 border-b border-gray-700/50 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-600/20 rounded-xl">
                      <FiPlusCircle className="text-green-400" size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">
                        Create Board
                      </h2>
                      <p className="text-gray-400 text-sm">
                        Start a new collaboration space
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeBoards}
                    className="p-2 hover:bg-gray-700/50 rounded-xl transition-colors duration-200 group"
                  >
                    <X size={24} className="text-gray-400 group-hover:text-white transition-colors" />
                  </button>
                </div>
              </div>

              {/* Modal Form */}
              <form onSubmit={(e) => { e.preventDefault(); createBoard(); }} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    Board Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Enter board title..."
                    value={boardData.title}
                    onChange={handleBoardChange}
                    className="w-full px-4 py-4 rounded-xl border border-gray-600 bg-gray-800/50 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-all duration-200 placeholder-gray-500 text-white"
                    required
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-700/50">
                  <button
                    type="button"
                    onClick={closeBoards}
                    className="px-6 py-3 rounded-xl bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg hover:shadow-green-600/25 transition-all duration-300 transform hover:scale-105"
                  >
                    Create Board
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;

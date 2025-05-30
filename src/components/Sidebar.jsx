import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../Global_State/AuthContext";
import { useNavigate } from "react-router";
import { FiHome, FiPlusCircle } from "react-icons/fi";
import { HiOutlineMenuAlt3 } from "react-icons/hi";
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
      className={`h-screen bg-gradient-to-br from-gray-900 to-black text-white transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      } shadow-lg relative`}
    >
      {/* Collapse/Expand Button */}
      <button
        className="absolute top-4 right-4 text-gray-400 hover:text-white"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <HiOutlineMenuAlt3 size={24} />
      </button>

      {/* Sidebar Header */}
      <div className={`p-5 ${isCollapsed ? "text-center" : "text-left"}`}>
        <h2 className="text-xl font-bold">
          {isCollapsed ?  <img className="h-6" src={icon} alt="Logotype" /> : <img className="h-6" src={logotype} alt="Logotype" />}
        </h2>
      </div>

      {/* Menu Items */}
      <nav className="mt-6 space-y-2">

        {/* Create Board (Manager Only) */}
        {auth?.user?.role === "manager" && (
          <div
            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-800 rounded transition text-green-400"
            onClick={openBoards}
          >
            <FiPlusCircle size={20} />
            {!isCollapsed && <span>Create Board</span>}
          </div>
        )}
        
        <div
          className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-800 rounded transition ${
            selected === "home" ? "bg-gray-800 border-l-4 border-green-400" : ""
          }`}
          onClick={handleHome}
        >
          <FiHome size={20} />
          {!isCollapsed && <span>Home</span>}
        </div>

      </nav>

      {/* Modal for Creating Board */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" >
          <div className="bg-white p-6 rounded-lg w-full max-w-md text-black " ref={modalRef}>
            <h2 className="text-xl font-semibold mb-4">Create Board</h2>
            <input
              type="text"
              name="title"
              placeholder="Board Title"
              value={boardData.title}
              onChange={handleBoardChange}
              className="w-full p-2 border rounded"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={closeBoards}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded"
                onClick={createBoard}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;

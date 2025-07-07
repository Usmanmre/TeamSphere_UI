import React, { useEffect, useState, useRef } from "react";
import { useBoard } from "../Global_State/BoardsContext";
import BASE_URL from "../config";
import { useAuth } from "../Global_State/AuthContext";
import debounce from "lodash.debounce";
import socket from "../socket";
import { useTasks } from "../Global_State/TaskContext";
import { getUsernameFromEmail } from "../helper";
import { X, Edit3, Users, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";

const TaskModal = ({ isOpen, onClose, onSubmit, taskData }) => {
  const modalRef = useRef(null);
  const initialFormState = {
    title: "",
    description: "",
    assignedTo: "",
    status: "todo",
    selectedBoard: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const { mySelectedTask, selectedTaskGlobalUpdate, myTeam } = useTasks();
  const [currentlyTyping, setCurrentlyTyping] = useState(null);
  const inputRef = useRef(null);
  const { myBoards } = useBoard();
  const { auth } = useAuth();

  const debouncedBroadcast = debounce((value) => {
    socket.emit("task:edit", {
      taskId: mySelectedTask?._id,
      content: value,
      editedBy: auth?.user.email,
    });
  }, 2000);

  useEffect(() => {
    if (mySelectedTask) {
      setFormData({
        title: mySelectedTask.title || "",
        description: mySelectedTask.description || "",
        assignedTo: mySelectedTask.assignedTo || "",
        selectedBoard: mySelectedTask?.boardID || "",
        status: mySelectedTask.status || "todo",
        taskID: mySelectedTask._id || "",
        boardID: mySelectedTask.boardID || "",
      });
    } else {
      setFormData(initialFormState);
    }
  }, [mySelectedTask, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose(); // Close the modal
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (mySelectedTask?._id) {
      socket.emit("joinTaskRoom", mySelectedTask._id);
    }
  }, [mySelectedTask]);

  useEffect(() => {
    socket.on("task:edited", ({ taskId, content, editedBy }) => {
      selectedTaskGlobalUpdate(content);
      const typer = getUsernameFromEmail(editedBy);
      setCurrentlyTyping(typer);

      // Auto-hide after 3 seconds of no updates
      const timeout = setTimeout(() => setCurrentlyTyping(null), 2000);

      return () => clearTimeout(timeout);
    });

    return () => socket.off("task:edited");
  }, []);

  const handleBoardChange = (e) => {
    const { value } = e.target;

    // Find the selected board object based on _id
    const selectedBoard = myBoards.find((board) => board._id === value) || null;

    setFormData((prev) => ({
      ...prev,
      selectedBoard, // Store the full object instead of just the ID
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "description") {
      debouncedBroadcast(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, taskData?._id);
    onClose();
    setFormData(initialFormState);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "todo":
        return <Clock className="text-orange-400" size={16} />;
      case "inProgress":
        return <AlertCircle className="text-blue-400" size={16} />;
      case "done":
        return <CheckCircle className="text-green-400" size={16} />;
      default:
        return <Clock className="text-gray-400" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "todo":
        return "border-orange-500 bg-orange-500/10 text-orange-400";
      case "inProgress":
        return "border-blue-500 bg-blue-500/10 text-blue-400";
      case "done":
        return "border-green-500 bg-green-500/10 text-green-400";
      default:
        return "border-gray-500 bg-gray-500/10 text-gray-400";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="w-full max-w-2xl">
        <div
          ref={modalRef}
          className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl w-full rounded-3xl border border-gray-700/50 overflow-hidden transform transition-all duration-300 scale-100"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 border-b border-gray-700/50 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/20 rounded-xl">
                  <Edit3 className="text-blue-400" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {taskData ? "Edit Task" : "Create New Task"}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {taskData ? "Update your task details" : "Add a new task to your board"}
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
            {/* Title */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Task Title
              </label>
              <input
                ref={inputRef}
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter task title..."
                className="w-full px-4 py-4 rounded-xl border border-gray-600 bg-gray-800/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 placeholder-gray-500 text-white"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Description
              </label>
              {currentlyTyping && (
                <div className="flex items-center gap-2 text-sm text-blue-400 bg-blue-500/10 px-3 py-2 rounded-lg border border-blue-500/20">
                  <div className="flex space-x-1">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></span>
                  </div>
                  <span>{currentlyTyping} is typing...</span>
                </div>
              )}
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe your task..."
                className="w-full px-4 py-4 rounded-xl border border-gray-600 bg-gray-800/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 placeholder-gray-500 text-white resize-none"
                rows={4}
              />
            </div>

            {/* Manager-specific fields */}
            {auth?.user?.role === "manager" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Select Board */}

                <div className="space-y-2">
                  <label className=" text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    Select Board
                  </label>

                  <select
                    name="selectedBoard"
                    value={formData.selectedBoard ? formData.selectedBoard : ""}
                    onChange={handleBoardChange}
                    className="w-full px-4 py-4 rounded-xl border border-gray-600 bg-gray-800/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 text-white"
                  >
                    <option value="" disabled className="bg-gray-800">
                      Choose a board
                    </option>
                    {Array.isArray(myBoards) &&
                      myBoards.map((board) => (
                        <option key={board.boardID} value={board.boardID} className="bg-gray-800">
                          {board.title}
                        </option>
                      ))}
                  </select>


                </div>

                {/* Assigned To */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <Users className="text-yellow-400" size={16} />
                    Assigned To
                  </label>
                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    className="w-full px-4 py-4 rounded-xl border border-gray-600 bg-gray-800/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 text-white"
                  >
                    <option value="" disabled className="bg-gray-800">
                      Select team member
                    </option>
                    {myTeam?.map((member) => (
                      <option key={member.email} value={member.email} className="bg-gray-800">
                        {member.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                Status
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "todo", label: "To Do", icon: <Clock className="text-orange-400" size={16} /> },
                  { value: "inProgress", label: "In Progress", icon: <AlertCircle className="text-blue-400" size={16} /> },
                  { value: "done", label: "Done", icon: <CheckCircle className="text-green-400" size={16} /> }
                ].map((status) => (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: status.value }))}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                      formData.status === status.value
                        ? getStatusColor(status.value)
                        : "border-gray-600 bg-gray-800/50 text-gray-400 hover:border-gray-500"
                    }`}
                  >
                    {status.icon}
                    <span className="font-medium">{status.label}</span>
                  </button>
                ))}
              </div>
            </div>

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
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-blue-600/25 transition-all duration-300 transform hover:scale-105"
              >
                {taskData ? "Update Task" : "Create Task"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;

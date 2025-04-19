import React, { useEffect, useState, useRef } from "react";
import { useBoard } from "../Global_State/BoardsContext";
import BASE_URL from "../config";
import { useAuth } from "../Global_State/AuthContext";
import debounce from "lodash.debounce";
import socket from "../socket";
import { useTasks } from "../Global_State/TaskContext";

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
  const { mySelectedTask, selectedTaskGlobalUpdate } = useTasks();
  const [currentlyTyping, setCurrentlyTyping] = useState(null);
  const [myTeam, setMyTeam] = useState([]);
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
        selectedBoard: mySelectedTask.selectedBoard || "",
        status: mySelectedTask.status || "todo",
        taskID: mySelectedTask._id || "",
        boardID: mySelectedTask.boardID || "",
      });
    } else {
      setFormData(initialFormState);
    }
  }, [mySelectedTask, isOpen]);

  useEffect(() => {
    if (isOpen) {
      getTeam();
      setTimeout(() => inputRef.current?.focus(), 100); // Focus title field
    }
  }, [isOpen]);

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

  function getUsernameFromEmail(email) {
    const match = email.match(/^([^@]+)@/);
    return match ? match[1] : null;
  }

  const getTeam = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please log in.");
    const response = await fetch(`${BASE_URL}/api/auth/getTeam`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: token },
    });

    if (response.ok) {
      const team = await response.json();
      setMyTeam(team);
    } else {
      console.error("Failed to fetch team");
    }
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 w-full backdrop-blur-sm flex justify-center items-center z-50  ">
      <div className="modal-content  w-1/2 flex justify-center">
        <div
          ref={modalRef}
          className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 shadow-2xl w-full rounded-2xl p-6  max-w-lg transform transition-all scale-100"
        >
          <h2 className="text-2xl font-bold tracking-tight mb-6 text-center">
            {taskData ? "Edit Task" : "Create New Task"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                ref={inputRef}
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 dark:bg-gray-800"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              {currentlyTyping && (
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {/* <div className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full text-xs font-bold animate-pulse">
      {currentlyTyping}
    </div> */}
                  <span>{currentlyTyping} is typing</span>
                  <div className="flex space-x-1">
                    <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              )}

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 dark:bg-gray-800 resize-none"
                rows={3}
              />
            </div>

            {/* Select Board */}
            {auth?.user?.role === "manager" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Select Board
                  </label>
                  <select
                    name="selectedBoard"
                    value={
                      formData.selectedBoard ? formData.selectedBoard.title : ""
                    }
                    onChange={handleBoardChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 dark:bg-gray-800"
                  >
                    <option value="" disabled>
                      Select Board
                    </option>
                    {Array.isArray(myBoards) &&
                      myBoards.map((board) => (
                        <option key={board._id} value={board._id}>
                          {board.title}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Assigned To
                  </label>
                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 dark:bg-gray-800"
                  >
                    <option value="" disabled>
                      Select Member
                    </option>
                    {myTeam?.map((member) => (
                      <option key={member.email} value={member.email}>
                        {member.email}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 dark:bg-gray-800"
              >
                <option value="todo">To Do</option>
                <option value="inProgress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
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

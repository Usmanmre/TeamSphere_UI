import React, { useEffect, useState, useRef } from "react";
import { useBoard } from "../Global_State/BoardsContext";

const TaskModal = ({ isOpen, onClose, onSubmit, taskData }) => {
  const initialFormState = {
    title: "",
    description: "",
    assignedTo: "",
    status: "todo",
    selectedBoard: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [myTeam, setMyTeam] = useState([]);
  const inputRef = useRef(null);
  const { myBoards } = useBoard();

  useEffect(() => {
    if (taskData) {
      setFormData({
        title: taskData.title || "",
        description: taskData.description || "",
        assignedTo: taskData.assignedTo || "",
        selectedBoard: taskData.selectedBoard || "",
        status: taskData.status || "todo",
        taskID: taskData.taskID || "",
        boardID: taskData.boardID || "",
      });
    } else {
      setFormData(initialFormState);
    }
  }, [taskData, isOpen]);

  useEffect(() => {
    if (isOpen) {
      console.log("isOpen", isOpen);
      getTeam();
      setTimeout(() => inputRef.current?.focus(), 100); // Focus title field
    }
  }, [isOpen]);

  const getTeam = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please log in.");

    const response = await fetch("http://localhost:3001/api/auth/getTeam", {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("name", name);
    console.log("value", value);
    console.log("myBoards", myBoards);

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, taskData?._id);
    onClose();
    setFormData(initialFormState);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 shadow-2xl rounded-2xl p-6 w-full max-w-lg transform transition-all scale-100">
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
          <div>
  <label className="block text-sm font-medium mb-1">Select Board</label>
  <select
    name="selectedBoard"
    value={formData.selectedBoard}
    onChange={handleChange}
    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 dark:bg-gray-800"
  >
    {/* Default option (disabled & pre-selected) */}
    <option value="" disabled selected={!formData.selectedBoard}>
      Select Board
    </option>

    {/* Dynamically list available boards */}
    {myBoards?.map((board) => (
      <option key={board.title} value={board.title}>
        {board.title}
      </option>
    ))}
  </select>
</div>


          {/* Assigned To */}
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
  );
};

export default TaskModal;

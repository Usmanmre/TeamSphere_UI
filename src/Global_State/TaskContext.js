import React, { createContext, useContext, useState } from "react";
import { useBoard } from "../Global_State/BoardsContext";
const TasksContext = new createContext();

// Auth Provider Component
export const TasksProvider = ({ children }) => {
  const [myTasks, setMyTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const { currentBoard } = useBoard();

  const getAllTasks = async () => {
    if (!currentBoard.boardID) {
      console.log("No current board selected. Skipping API call.");
      return;
    } else {
      try {
        setTasksLoading(true);
        const boardID = currentBoard.boardID;
        const token = localStorage.getItem("token"); // Retrieve token from localStorage
        if (!token) {
          console.error("No token found. Please log in.");
          return;
        }
        console.log("calling getAllTasks");

        const response = await fetch(
          `http://localhost:3001/api/task/all?boardID=${boardID}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`, // Attach the token to the request
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error getting tashs:", errorData);
          return;
        }
        const result = await response.json();
        setMyTasks(result); // Set fetched boards
        setTasksLoading(false);
      } catch (err) {
        console.error("Error fetching boards:", err);
      }
    }
  };

  return (
    <TasksContext.Provider value={{ getAllTasks, myTasks, tasksLoading }}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => useContext(TasksContext);

import React, { createContext, useContext, useState } from "react";
import { useBoard } from "../Global_State/BoardsContext";
import BASE_URL from "../config"; 

const TasksContext = new createContext();

// Auth Provider Component
export const TasksProvider = ({ children = null }) => {
  const [myTasks, setMyTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const { currentBoard } = useBoard();

  const getAllTasks = async () => {

    if (!currentBoard.boardID) {
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

        const response = await fetch(
          `${BASE_URL}/api/task/all?boardID=${boardID}`,
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

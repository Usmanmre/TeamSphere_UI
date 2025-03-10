import React, { createContext, useContext, useState } from "react";

const BoardsContext = new createContext();

// Auth Provider Component
export const BoardProvider = ({ children }) => {
  const [myBoards, setMyBoards] = useState([]);
  const [currentBoard, setcurrentBoard] = useState({});

  const getAllBoards = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (!token || !user) {
        console.error("Missing token or user data. Please log in.");
        return;
      }

      const parsedUser = JSON.parse(user);
      const role = parsedUser?.role;

      if (!role) {
        console.error("User role not found.");
        return;
      }

      const response = await fetch(
        `http://localhost:3001/api/board/all?role=${encodeURIComponent(role)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: ` ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error getting boards:", errorData);
        return;
      }

      const result = await response.json();
      setMyBoards(result);
    } catch (err) {
      console.error("Error fetching boards:", err.message);
    }
  };

  const setCurrentBoardGlobally = (board) => {
    console.log('setCurrentBoardGlobally', board)
    setcurrentBoard(board);
  };
  return (
    <BoardsContext.Provider
      value={{ myBoards, getAllBoards, currentBoard, setCurrentBoardGlobally }}
    >
      {children}
    </BoardsContext.Provider>
  );
};

export const useBoard = () => useContext(BoardsContext);

import React, { createContext, useContext, useState } from "react";
import BASE_URL from "../config";

const BoardsContext = new createContext();

// Auth Provider Component
export const BoardProvider = ({ children }) => {
  const [myBoards, setMyBoards] = useState([]);
  const [myOnlineUsers, setOnlineUsers] = useState([]);

  const [currentBoard, setcurrentBoard] = useState({});

  const getAllBoards = async () => {
    try {
      let token = localStorage.getItem("token");
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

      // ✅ First attempt with current token
      let response = await fetch(
        `${BASE_URL}/api/board/all?role=${encodeURIComponent(role)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: ` ${token}`,
          },
          credentials: "include", // send cookies if needed
        }
      );

      // 🔁 If token expired, try refresh
      if (response.status === 401) {
        const refreshResponse = await fetch(
          `${BASE_URL}/api/auth/refresh-token`,
          {
            method: "POST",
            credentials: "include", // refresh token sent via HTTP-only cookie
          }
        );
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          const newToken = data.accessToken;
          // Save and retry request
          localStorage.setItem("token", newToken);
          token = newToken;
          response = await fetch(
            `${BASE_URL}/api/board/all?role=${encodeURIComponent(role)}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: ` ${token}`,
              },
              credentials: "include",
            }
          );
        } else {
          console.error("Failed to refresh token. Please log in again.");
          return;
        }
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error getting boards:", errorData);
        return;
      }

      const { allBoards, onlineUsers } = await response.json();
      setMyBoards(allBoards);
      setOnlineUsers(onlineUsers);
    } catch (err) {
      console.error("Error fetching boards:", err.message);
    }
  };

  const setCurrentBoardGlobally = (board) => {
    setcurrentBoard(board);
  };
  return (
    <BoardsContext.Provider
      value={{
        myBoards,
        getAllBoards,
        currentBoard,
        setCurrentBoardGlobally,
        myOnlineUsers,
      }}
    >
      {children}
    </BoardsContext.Provider>
  );
};

export const useBoard = () => useContext(BoardsContext);

import React, { createContext, useContext, useState } from "react";
import { useBoard } from "../Global_State/BoardsContext";

import socket from "../socket";

const AuthContext = new createContext();
// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const { setCurrentBoardGlobally } = useBoard();

  const [auth, setAuth] = useState({
    token: localStorage.getItem("token") || null,
    user: JSON.parse(localStorage.getItem("user")) || null,
  });

  // Login function
  const login = (token, userInfo) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userInfo));
    setAuth({ token, user: userInfo });
  };

  // Logout function
  const logout = () => {
      console.log("Disconnected to Socket.io Server! ID:", socket.id);
      const userString = localStorage.getItem("user");
      const userID = JSON.parse(userString); // Now you have an object
      if (userID) {
        socket.emit("logout", userID.email);
      }
    setCurrentBoardGlobally(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({ token: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using Auth Context
export const useAuth = () => useContext(AuthContext);

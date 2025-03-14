import React, { createContext, useContext, useState } from "react";
import { useBoard } from "../Global_State/BoardsContext";

const AuthContext = new createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const { currentBoard, setCurrentBoardGlobally } = useBoard();
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
    setCurrentBoardGlobally(null)
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({ token: null, user: null });
    console.log('currentBoard logout', currentBoard)
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using Auth Context
export const useAuth = () => useContext(AuthContext);

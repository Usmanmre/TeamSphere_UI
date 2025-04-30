// AppProviders.js
import React from "react";
import { AuthProvider } from "./AuthContext";
import { BoardProvider } from "./BoardsContext";
import { TasksProvider } from "./TaskContext";

export const AppProviders = ({ children }) => {
  return (
      <BoardProvider>
        <AuthProvider>
          <TasksProvider>
            {children}
          </TasksProvider>
        </AuthProvider>
      </BoardProvider>
  );
};

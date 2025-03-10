import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./Global_State/AuthContext";
import { BoardProvider } from "./Global_State/BoardsContext";
import { TasksProvider } from "./Global_State/TaskContext";


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <BoardProvider>
        <TasksProvider>
        <App />
        </TasksProvider>
      </BoardProvider>
    </AuthProvider>
  </React.StrictMode>
);

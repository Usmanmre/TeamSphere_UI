// src/App.js
import {
  BrowserRouter as Router,
} from "react-router-dom";
import "./App.css";
import { Toaster } from "react-hot-toast";
import process from "process";
import Routes from "./Routes/Routes";

window.process = process;

const App = ({ onResetApp }) => {
  return (
    <Router>
      <Toaster position="bottom-right" />
      <Routes onResetApp={onResetApp} />
    </Router>
  );
};

export default App;

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Register from "./components/Register";
import Login from "./components/Login";
import LandingPage from "./components/LandingPage";
import TrelloBoard from "./components/TrelloBoard";
import { Toaster } from "react-hot-toast";
import process from "process";
window.process = process;

const App = ({ onResetApp }) => {
  return (
    <Router>
      <Toaster position="bottom-right" />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/board"
          element={<TrelloBoard onResetApp={onResetApp} />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;

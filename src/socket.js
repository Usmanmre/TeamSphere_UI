import { io } from "socket.io-client";

const BACKEND_URL = "https://aesthetic-lorianna-teamsphere-b28ca5af.koyeb.app"; // Your Koyeb backend URL
// const BACKEND_URL = "http://localhost:3001"; // Your Koyeb backend URL


// Connect to the backend (change to your backend URL)
const socket = io(BACKEND_URL, {
  transports: ["websocket"], // Ensures WebSocket connection
  withCredentials: true, // If using authentication
});

// Listen for connection success
socket.on("connect", () => {
  console.log("Connected to Socket.io Server! ID:", socket.id);
  const userString = localStorage.getItem("user");
  const userID = JSON.parse(userString); // Now you have an object
  socket.emit("joinRoom", userID?.email);
});


// Export socket instance if needed
export default socket;

import { io } from "socket.io-client";

// Connect to the backend (change to your backend URL)
const socket = io("http://localhost:3001", {
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

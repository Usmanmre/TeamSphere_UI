import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { useAuth } from "../Global_State/AuthContext";
import BASE_URL from "../config";
import toast from "react-hot-toast";
import fullLogo from "../assets/Full.png";

const Register = () => {
  let navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [emailError, setEmailError] = useState("");

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // Simple regex for email validation
  };
  // Function to handle input changes
  const handleUser = (event) => {
    const { name, value } = event.target;

    if (name === "email") {
      if (!isValidEmail(value)) {
        setEmailError("Invalid email format");
      } else {
        setEmailError("");
      }
    }
    setUser({
      ...user,
      [name]: value,
    });
  };
  const registerUser = async () => {
    try {
      setIsLoading(true);
  
      const response = await axios.post(
        `${BASE_URL}/api/auth/register`,
        user, // User object
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      // Handle success response
      if (response.status === 201 && response.data.status === "success") {
        console.log("User registered successfully:", response.data);
  
        const { token, user } = response.data;
        login(token, user);
        navigate("/board");
        toast.success("User registered successfully 🎉");
      } else {
        console.error("Unexpected response:", response);
        toast.error("Unexpected error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Error during user registration:", error);
  
      // Check if it's an Axios error with a response
      if (error.response) {
        const { status, data } = error.response;
  
        if (status === 409) {
          toast.error("User already exists. Please log in.");
        } else if (status === 400) {
          toast.error(data.message || "Invalid input. Please check your details.");
        } else if (status === 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error(data.message || "Registration failed. Please try again.");
        }
      } else {
        // Handle network errors
        toast.error("Network error. Please check your internet connection.");
      }
    } finally {
      setIsLoading(false); // Ensure loading state is reset
    }
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white relative overflow-hidden">

       {/* Full Logo at Top-Left */}
       <div className="absolute top-10 left-10">
        <img src={fullLogo} alt="TeamSphere Logo" className="h-16 md:h-10" />
      </div>
      {/* Subtle background glow circles */}
      <div className="absolute top-10 left-10 w-60 h-60 bg-purple-500 rounded-full mix-blend-screen opacity-30 blur-[120px]"></div>
      <div className="absolute bottom-10 right-10 w-60 h-60 bg-blue-500 rounded-full mix-blend-screen opacity-30 blur-[120px]"></div>

      {/* Glassmorphic Register Card */}
      <div className="relative z-10 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-xl p-8 w-full max-w-md space-y-6">
        <h2 className="text-4xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
          Create an Account
        </h2>
        <p className="text-gray-300 text-center">
          Join TeamSphere and collaborate effortlessly
        </p>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="relative">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={user.name}
              onChange={handleUser}
              className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-500 transition"
            />
          </div>

          <div className="relative">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={user.email}
              onChange={handleUser}
              className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-500 transition"
            />
          </div>
          {emailError && <p className="text-red-500">{emailError}</p>}

          <div className="relative">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={user.password}
              onChange={handleUser}
              className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-500 transition"
            />
          </div>

          <div className="relative">
            <select
              id="role"
              name="role"
              value={user.role}
              onChange={handleUser}
              className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            >
              <option value="" disabled>
                Select Role
              </option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          <button
            type="submit"
            onClick={registerUser}
            disabled={isLoading}
            className={`w-full py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-teal-700 transition duration-300 shadow-md flex items-center justify-center ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Signing in...
              </div>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="text-center text-gray-400">
          <p>
            Already have an account?{" "}
            <a href="/login" className="text-purple-400 hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { useAuth } from "../Global_State/AuthContext";
import BASE_URL from "../config";
import toast from "react-hot-toast";
import fullLogo from "../assets/Full.png";

const Login = () => {
  let navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = (event) => {
    const { name, value } = event.target;
    setCredentials({
      ...credentials,
      [name]: value,
    });
  };

  const loginUser = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/auth/login`,
        credentials,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: "include", // This is what allows cookies to be set!
        }
      );

      if (response.status === 200) {
        const { token, user } = response.data;
        login(token, user);
        if (user.role === "hr") {
          navigate("/hr/dashboard");
        } else {
          navigate("/board");
        }
        toast.success("Login Successfull");
      } else {
        console.error("Unexpected response status:", response.status);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          toast.error(error.response.data?.message);
        } else if (error.response.status === 401) {
          toast.error(error.response.data?.message);
        }
      } else if (error.request) {
        // Handle no response from server
        console.error("No response from server. Check your connection.");
      } else {
        // Handle other unexpected errors
        console.error("Login error:", error.message);
      }
    } finally {
      setIsLoading(false); // Ensures loading state is reset in all cases
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white relative overflow-hidden">
      {/* Full Logo at Top-Left */}
      <div className="absolute top-10 left-10">
        <img src={fullLogo} alt="TeamSphere Logo" className="h-16 md:h-10" />
      </div>
      {/* Subtle background glow circles */}
      <div className="absolute top-10 left-10 w-60 h-60 bg-blue-500 rounded-full mix-blend-screen opacity-30 blur-[120px]"></div>
      <div className="absolute bottom-10 right-10 w-60 h-60 bg-green-500 rounded-full mix-blend-screen opacity-30 blur-[120px]"></div>

      {/* Glassmorphic Login Card */}
      <div className="relative z-10 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-xl p-8 w-full max-w-md space-y-6">
        <h2 className="text-4xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
          Welcome Back
        </h2>
        <p className="text-gray-300 text-center">
          Log in to access your TeamSphere dashboard
        </p>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="relative">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={credentials.email}
              onChange={handleLogin}
              className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-gray-500 transition"
            />
          </div>

          <div className="relative">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleLogin}
              className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-gray-500 transition"
            />
          </div>

          <button
            type="submit"
            onClick={loginUser}
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
                Logging in...
              </div>
            ) : (
              "Log In"
            )}
          </button>
        </form>

        <div className="text-center text-gray-400">
          <p>
            Don’t have an account?{" "}
            <a href="/register" className="text-green-400 hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

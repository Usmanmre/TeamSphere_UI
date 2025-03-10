import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white relative overflow-hidden">

      {/* Subtle background blur elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-screen opacity-30 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-green-500 rounded-full mix-blend-screen opacity-30 blur-3xl animate-pulse"></div>

      {/* Glassmorphic Card Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl px-10 py-14 max-w-lg text-center space-y-6"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
          Welcome to TeamSphere
        </h1>
        <p className="text-gray-300 text-base md:text-lg">
          Streamline your team's workflow and collaboration effortlessly.
        </p>

        {/* Modern buttons with hover animation */}
        <div className="flex justify-center gap-5 mt-6">
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-lg text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 font-semibold transition"
            >
              Register
            </motion.button>
          </Link>

          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-lg text-white bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 font-semibold transition"
            >
              Login
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="absolute bottom-4 text-gray-500 text-xs">
        <p>&copy; {new Date().getFullYear()} TeamSphere. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;

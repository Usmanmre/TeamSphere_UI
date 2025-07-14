import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { useAuth } from "../Global_State/AuthContext";
import BASE_URL from "../config";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Shield, 
  Zap,
  Users,
  CheckCircle,
  Crown,
  Briefcase,
  UserCheck
} from "lucide-react";
import fullLogo from "../assets/Full.png";
import { Link } from "react-router-dom";

const Register = () => {
  let navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { login } = useAuth();
  const [emailError, setEmailError] = useState("");

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

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
    if (!user.name || !user.email || !user.password || !user.role) {
      toast.error("Please fill in all fields");
      return;
    }

    if (emailError) {
      toast.error("Please fix the email format");
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post(
        `${BASE_URL}/api/auth/register`,
        user,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201 && response.data.status === "success") {
        const { token, user } = response.data;
        login(token, user);
        navigate("/board");
        toast.success("Account created successfully! 🎉");
      } else {
        console.error("Unexpected response:", response);
        toast.error("Unexpected error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Error during user registration:", error);

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
        toast.error("Network error. Please check your internet connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { value: "manager", label: "Manager", icon: <Crown className="w-4 h-4" />, description: "Lead teams and manage projects" },
    { value: "employee", label: "Employee", icon: <UserCheck className="w-4 h-4" />, description: "Collaborate and complete tasks" },
    { value: "hr", label: "HR", icon: <Briefcase className="w-4 h-4" />, description: "Manage recruitment and HR processes" },
  ];

  const benefits = [
    { icon: <Shield className="w-5 h-5" />, text: "Enterprise Security" },
    { icon: <Zap className="w-5 h-5" />, text: "Lightning Fast" },
    { icon: <Users className="w-5 h-5" />, text: "Team Collaboration" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={fullLogo} alt="TeamSphere Logo" className="h-8 transition-transform group-hover:scale-105" />
                {/* <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                  TeamSphere
                </span> */}
          </Link>
        </div>
      </nav>

      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl w-full items-center">
          {/* Left Side - Hero Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden lg:block"
          >
            <div className="space-y-8">
              <div>
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-5xl font-bold mb-6"
                >
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-green-400">
                    Join TeamSphere
                  </span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-xl text-gray-300 leading-relaxed"
                >
                  Create your account and start collaborating with your team. 
                  Choose your role and unlock powerful features designed to boost productivity.
                </motion.p>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Why join TeamSphere?</h3>
                <div className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                      className="flex items-center gap-3 text-gray-300"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                        {benefit.icon}
                      </div>
                      <span>{benefit.text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Side - Register Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <div className="w-full max-w-md">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl p-8"
              >
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="w-8 h-8 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                  <p className="text-gray-400">Join the TeamSphere community</p>
                </div>

                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="space-y-2"
                  >
                    <label className="block text-sm font-medium text-gray-300">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        value={user.name}
                        onChange={handleUser}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full pl-10 pr-4 py-4 bg-gray-800/50 border rounded-xl focus:outline-none transition-all duration-300 placeholder-gray-500 text-white ${
                          focusedField === 'name' 
                            ? 'border-purple-500 ring-2 ring-purple-500/20' 
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="space-y-2"
                  >
                    <label className="block text-sm font-medium text-gray-300">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={user.email}
                        onChange={handleUser}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full pl-10 pr-4 py-4 bg-gray-800/50 border rounded-xl focus:outline-none transition-all duration-300 placeholder-gray-500 text-white ${
                          focusedField === 'email' 
                            ? 'border-purple-500 ring-2 ring-purple-500/20' 
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      />
                    </div>
                    {emailError && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mt-1"
                      >
                        {emailError}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                    className="space-y-2"
                  >
                    <label className="block text-sm font-medium text-gray-300">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Create a strong password"
                        value={user.password}
                        onChange={handleUser}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full pl-10 pr-12 py-4 bg-gray-800/50 border rounded-xl focus:outline-none transition-all duration-300 placeholder-gray-500 text-white ${
                          focusedField === 'password' 
                            ? 'border-purple-500 ring-2 ring-purple-500/20' 
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                    className="space-y-2"
                  >
                    <label className="block text-sm font-medium text-gray-300">
                      Select Role
                    </label>
                    <div className="relative">
                      <select
                        name="role"
                        value={user.role}
                        onChange={handleUser}
                        onFocus={() => setFocusedField('role')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full py-4 pl-10 pr-4 bg-gray-800/50 border rounded-xl focus:outline-none transition-all duration-300 text-white ${
                          focusedField === 'role' 
                            ? 'border-purple-500 ring-2 ring-purple-500/20' 
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <option value="" disabled className="bg-gray-800">
                          Choose your role
                        </option>
                        {roleOptions.map((option) => (
                          <option key={option.value} value={option.value} className="bg-gray-800">
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <Users className="w-5 h-5" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.4 }}
                  >
                    <button
                      type="submit"
                      onClick={registerUser}
                      disabled={isLoading}
                      className={`w-full py-4 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2 ${
                        isLoading ? "cursor-not-allowed" : ""
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </motion.div>
                </form>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.6 }}
                  className="text-center mt-8 pt-6 border-t border-gray-700/50"
                >
                  <p className="text-gray-400">
                    Already have an account?{" "}
                    <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                      Sign in
                    </Link>
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;

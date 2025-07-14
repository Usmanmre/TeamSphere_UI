// src/AppRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Register from "../components/Register";
import Login from "../components/Login";
import LandingPage from "../components/LandingPage";
import TrelloBoard from "../components/TrelloBoard";
import ZoomAuth from "../pages/ZoomAuth";
import CreateMeeting from "../pages/CreateMeeting";
import ProtectedRoute from "../Routes/ProtectedRoute";
import HRDashboard from "../components/HRDashboard";
import Unauthorized from "../components/Unauthorized";
import JobForm from "../pages/JobForm";
import JobList from "../components/JobList";
import Career from "../components/Career";
import JobDetails from "../components/JobDetails";
import DonationPools from "../pages/DonationPools";
import DonationPoolDetail from "../pages/DonationPoolDetail";


const AppRoutes = ({ onResetApp }) => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/zoom/callback" element={<ZoomAuth />} />
      <Route path="/create-meeting" element={<CreateMeeting />} />
      <Route path="/board" element={<TrelloBoard onResetApp={onResetApp} />} />
      <Route path="/job-form" element={<JobForm />} />
      <Route path="/job-list" element={<JobList />} />
      <Route path="/career" element={<Career />} />
      <Route path="/jobs/:id" element={<JobDetails/>} />




      {/* Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={["hr"]} />}>
        <Route path="/hr/dashboard" element={<HRDashboard />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={["manager", "employee"]} />}>
        <Route path="/donation-pools" element={<DonationPools />} />
        <Route path="/donation-pools/:id" element={<DonationPoolDetail />} />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;

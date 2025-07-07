import React, { useEffect, useState } from "react";

import BASE_URL from "../config";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Career = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchJobs = async () => {
    try {
      let token = localStorage.getItem("token");

      if (!token) {
        throw new Error("User not authenticated");
      }

      let res = await fetch(`${BASE_URL}/api/jobs/get/all-posted`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: ` ${token}`,
        },
      });

      if (res.status === 401) {
        const refreshResponse = await fetch(
          `${BASE_URL}/api/auth/refresh-token`,
          {
            method: "POST",
            credentials: "include", // refresh token sent via HTTP-only cookie
          }
        );

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const newToken = refreshData.accessToken;
          localStorage.setItem("token", newToken);
          token = newToken;

          // Retry original request with new token
          res = await fetch(`${BASE_URL}/api/jobs/get/all-posted`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: ` ${token}`,
            },
          });
        } else {
          console.error("Failed to refresh token. Please log in again.");
          toast.error("Session expired. Please log in again.");
          return;
        }
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch jobs");
      }

      const data = await res.json();
      setJobs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  if (loading) return <p className="text-center text-white">Loading jobs...</p>;
  if (error) return <p className="text-center text-red-400">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black py-12 px-6 sm:px-12 lg:px-24">
      <h2 className="text-4xl font-extrabold text-white mb-12 tracking-tight drop-shadow-lg">
        🤝 Join Us
      </h2>

      {jobs.length === 0 ? (
        <p className="text-gray-500 text-center text-lg">No jobs posted yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {jobs.map((job) => (
          <div
            key={job._id}
            className="bg-gradient-to-tr from-gray-800 via-gray-900 to-gray-800 border border-gray-700 rounded-2xl shadow-lg p-6 text-gray-200 flex flex-col justify-between hover:shadow-blue-600 transition-shadow duration-300 group"
          >
            {/* Top Section */}
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-semibold text-blue-400 group-hover:underline mb-1 transition">
                    {job.title}
                  </h3>
                  <p className="text-sm text-gray-400 italic">{job.department}</p>
                </div>
                <div className="text-sm text-gray-300 font-medium">
                  💰{" "}
                  {job.salaryRange
                    ? `$${job.salaryRange.min.toLocaleString()} - $${job.salaryRange.max.toLocaleString()}`
                    : "Not disclosed"}
                </div>
              </div>
      
              {/* Description */}
              <p className="text-sm text-gray-300 mt-4 mb-4 line-clamp-3 leading-relaxed">
                {job.description}
              </p>
      
              {/* Tags */}
              <div className="flex flex-wrap gap-2 text-sm mb-4">
                <span className="bg-gray-700 px-3 py-1 rounded-full">
                  📍 {job.location || "Remote"}
                </span>
                <span className="bg-gray-700 px-3 py-1 rounded-full">
                  🕒 {job.employmentType}
                </span>
                <span className="bg-gray-700 px-3 py-1 rounded-full">
                  📌 {job.status}
                </span>
              </div>
      
              {/* Skills */}
              {job.requiredSkills?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.requiredSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-700/30 text-blue-300 text-xs px-3 py-1 rounded-full font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
      
            {/* Action Button */}
            <div className="mt-auto pt-4 flex justify-end">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl transition shadow-md"
                onClick={() => navigate(`/jobs/${job._id}`)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
      
      )}
    </div>
  );
};

export default Career;

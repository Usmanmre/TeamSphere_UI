import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import BASE_URL from "../config";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

const JobList = () => {
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

      let res = await fetch(`${BASE_URL}/api/jobs/get/all`, {
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
          res = await fetch(`${BASE_URL}/api/jobs/get/all`, {
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
       <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-8 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </button>

      <h2 className="text-4xl font-extrabold text-white mb-12 tracking-tight drop-shadow-lg">
        📄 Posted Jobs
      </h2>

      {jobs.length === 0 ? (
        <p className="text-gray-500 text-center text-lg">No jobs posted yet.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-gradient-to-tr from-gray-800 via-gray-900 to-gray-800 border border-gray-700 rounded-3xl shadow-2xl p-8 hover:shadow-blue-600 transition-shadow duration-400 ease-in-out cursor-pointer"
              title={job.title}
              onClick={() => navigate(`/jobs/${job._id}`)}
            >
              <h3 className="text-2xl font-semibold text-blue-400 mb-1 truncate">
                {job.title}
              </h3>
              <p className="text-sm text-gray-400 italic mb-4">
                {job.department}
              </p>

              <p className="text-gray-300 text-sm leading-relaxed line-clamp-5 mb-6">
                {job.description}
              </p>

              <div className="flex flex-wrap gap-3 text-sm text-gray-300 mb-4">
                <span className="bg-gray-700 bg-opacity-50 rounded-full px-4 py-1 flex items-center gap-1 select-none">
                  📍 <span>{job.location || "Remote"}</span>
                </span>
                <span className="bg-gray-700 bg-opacity-50 rounded-full px-4 py-1 flex items-center gap-1 select-none">
                  ⏱ <span>{job.employmentType}</span>
                </span>
              </div>

              {job.requiredSkills?.length > 0 && (
                <div className="flex flex-wrap gap-2 text-sm mb-6">
                  {job.requiredSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-700/30 text-blue-300 px-4 py-1 rounded-full select-none font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <div className="text-sm text-gray-400 select-none font-semibold tracking-wide">
                💰{" "}
                {job.salaryRange
                  ? `$${job.salaryRange.min.toLocaleString()} - $${job.salaryRange.max.toLocaleString()}`
                  : "Salary not disclosed"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobList;

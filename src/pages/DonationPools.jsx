import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../config";
import { Gift } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const DonationPools = () => {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();


  const fetchPools = async (data) => {
    try {
      let token = localStorage.getItem("token");
  
      if (!token) {
        toast.error("No token found.");
        return;
      }
  
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`, // No extra space
        },
        withCredentials: true,
      };
  
      let response;
  
      try {
        response = await axios.post(
          `${BASE_URL}/api/donations/create/donation-pool`,
          data,
          config
        );
      } catch (err) {
        if (err.response?.status === 401) {
          // Token expired, attempt refresh
          const refreshRes = await axios.get(`${BASE_URL}/api/donations/all/donation-pools`, {
            headers: { Authorization: `${token}` },
            withCredentials: true,
          });
  
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            const newToken = refreshData.accessToken;
            localStorage.setItem("token", newToken);
  
            // Retry original request with new token
            response = await axios.get(`${BASE_URL}/api/donations/all/donation-pools`, {
                headers: { Authorization: `${newToken}` },
                withCredentials: true,
              });
          } else {
            toast.error("Session expired. Please log in again.");
            return;
          }
        } else {
          throw err; 
        }
      }
  
      console.log("response", response);
      toast.success("Donation created successfully!");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Something went wrong.");
    }
  };

  useEffect(() => {
    const fetchPools = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");
        const response = await axios.get(`${BASE_URL}/api/donations/all/donation-pools`, {
          headers: { Authorization: `${token}` },
          withCredentials: true,
        });
        setPools(response.data || []);
      } catch (err) {
        setError(err.message || "Failed to fetch donation pools");
      } finally {
        setLoading(false);
      }
    };
    fetchPools();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Gift size={32} className="text-pink-400" />
          <h1 className="text-3xl font-bold text-white">Donation Pools</h1>
        </div>
        {loading ? (
          <div className="text-center text-blue-300 py-10 animate-pulse">Loading donation pools...</div>
        ) : error ? (
          <div className="text-center text-red-400 py-10">{error}</div>
        ) : pools.length === 0 ? (
          <div className="text-center text-gray-400 py-10">No donation pools found.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {pools.map((pool) => (
              <div
                key={pool._id}
                onClick={() => navigate(`/donation-pools/${pool._id}`)}
                className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border border-gray-700 rounded-2xl shadow-xl p-6 hover:shadow-pink-500/30 transition-all duration-300 cursor-pointer hover:scale-105 hover:border-pink-500/50 group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Gift size={20} className="text-pink-400 group-hover:text-pink-300 transition-colors" />
                  <h2 className="text-xl font-semibold text-white truncate group-hover:text-pink-100 transition-colors">{pool.title}</h2>
                </div>
                <p className="text-gray-300 mb-3 line-clamp-3 group-hover:text-gray-200 transition-colors">{pool.description}</p>
                <div className="flex items-center gap-2 text-yellow-400 font-bold text-lg">
                  ${pool.amount?.toLocaleString() || 0}
                  <span className="text-xs text-gray-400 font-normal ml-1">raised</span>
                </div>
                <div className="mt-4 text-sm text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to view details and donate →
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationPools; 
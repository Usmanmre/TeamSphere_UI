import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import BASE_URL from "../config";
import { ArrowLeft, MapPin, Clock, DollarSign, Users, FileText, Calendar, Building, Award } from "lucide-react";

const JobDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApplyForm, setShowApplyForm] = useState(
    searchParams.get("apply") === "true"
  );
  const navigate = useNavigate();

  useEffect(() => {
    fetchSingleJob();
  }, [id]);

  const fetchSingleJob = async () => {
    try {
      setLoading(true);
      let token = localStorage.getItem("token");

      if (!token) throw new Error("User not authenticated");

      let res = await fetch(`${BASE_URL}/api/jobs/single/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      });

      if (res.status === 401) {
        const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh-token`, {
          method: "POST",
          credentials: "include",
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          localStorage.setItem("token", data.accessToken);
          token = data.accessToken;

          res = await fetch(`${BASE_URL}/api/jobs/single/${id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
          });
        } else {
          console.error("Session expired. Please log in again.");
          setError("Session expired. Please log in again.");
          return;
        }
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch job");
      }

      const jobData = await res.json();
      setJob(jobData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-blue-400 text-lg">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">Error: {error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg">Job not found</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition mt-4"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black">
      {/* Header with Back Button */}
      <div className="container mx-auto px-6 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-8 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Jobs</span>
        </button>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {/* Job Header */}
          <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 rounded-2xl p-8 mb-8 border border-gray-700 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  {job.title}
                </h1>
                <div className="flex items-center gap-2 text-blue-400 mb-6">
                  <Building size={20} />
                  <span className="text-lg font-medium">{job.department}</span>
                </div>
                
                {/* Job Meta Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-3 text-gray-300">
                    <MapPin className="text-blue-400" size={18} />
                    <span>{job.location || "Remote"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Clock className="text-green-400" size={18} />
                    <span>{job.employmentType}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <DollarSign className="text-yellow-400" size={18} />
                    <span>
                      ${job.salaryRange?.min?.toLocaleString()} - ${job.salaryRange?.max?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Calendar className="text-purple-400" size={18} />
                    <span>Posted recently</span>
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <div className="lg:text-right">
                {!showApplyForm && (
                  <button
                    onClick={() => setShowApplyForm(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-blue-600/25 transition-all duration-300 transform hover:scale-105"
                  >
                    Apply Now
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl mb-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <FileText className="text-blue-400" size={24} />
                  Job Description
                </h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
                    {job.description}
                  </p>
                </div>
              </div>

              {/* Required Skills */}
              {job.requiredSkills?.length > 0 && (
                <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Award className="text-green-400" size={24} />
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {job.requiredSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-600/20 text-blue-300 px-4 py-2 rounded-full border border-blue-500/30 font-medium hover:bg-blue-600/30 transition"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Company Info */}
              <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                  <Building className="text-blue-400" size={20} />
                  Company
                </h3>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-blue-400" />
                    <span>{job.location || "Remote"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users size={16} className="text-green-400" />
                    <span>Team collaboration</span>
                  </div>
                </div>
              </div>

              {/* Job Highlights */}
              <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4">Job Highlights</h3>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Competitive salary</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Flexible work options</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Growth opportunities</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span>Health benefits</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Application Form */}
          {showApplyForm && (
            <div className="mt-8 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Apply for this Position</h2>
              <form
                className="space-y-6"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">Full Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">Resume/CV</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition file:bg-blue-600 file:border-none file:px-4 file:py-2 file:rounded file:text-white file:mr-4"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">Cover Letter (Optional)</label>
                  <textarea
                    rows="4"
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Tell us why you're interested in this position..."
                  ></textarea>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-blue-600/25 transition-all duration-300 transform hover:scale-105"
                  >
                    Submit Application
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowApplyForm(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetails;

import React from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import BASE_URL from "../config";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

import { ArrowLeft } from "lucide-react";
const jobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description is required"),
  requiredSkills: z.string().optional(),
  location: z.string().min(1),
  salaryMin: z.string().regex(/^\d+$/, "Min salary must be a number"),
  salaryMax: z.string().regex(/^\d+$/, "Max salary must be a number"),
  employmentType: z.enum([
    "Full-time",
    "Part-time",
    "Contract",
    "Internship",
    "Temporary",
  ]),
  applicationSource: z.enum([
    "Company Website",
    "LinkedIn",
    "Google Form",
    "Other",
  ]),
});

const JobForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      location: "Remote",
      employmentType: "Full-time",
      applicationSource: "Company Website",
    },
  });
    let navigate = useNavigate();

    const onSubmit = async (data) => {
        const payload = {
          title: data.title,
          department: data.department,
          description: data.description,
          requiredSkills: data.requiredSkills
            ? data.requiredSkills.split(",").map((s) => s.trim())
            : [],
          location: data.location,
          salaryRange: {
            min: Number(data.salaryMin),
            max: Number(data.salaryMax),
          },
          employmentType: data.employmentType,
          applicationSource: data.applicationSource,
        };
      
        let token = localStorage.getItem("token");
        const user = localStorage.getItem("user");
      
        if (!token || !user) {
          console.error("Missing token or user data. Please log in.");
          toast.error("Please log in to continue.");
          return;
        }
      
        try {
          let response = await fetch(`${BASE_URL}/api/jobs/add`, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
              "Content-Type": "application/json",
              Authorization: ` ${token.trim()}`,
            },
            credentials: "include",
          });
      
          // If token expired, try refresh
          if (response.status === 401) {
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
              response = await fetch(`${BASE_URL}/api/jobs/add`, {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                  "Content-Type": "application/json",
                  Authorization: ` ${token.trim()}`,
                },
                credentials: "include",
              });
            } else {
              console.error("Failed to refresh token. Please log in again.");
              toast.error("Session expired. Please log in again.");
              // Optionally redirect to login page
              navigate("/login");
              return;
            }
          }
      
          // Check if request succeeded after retry (or initially)
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Server error");
          }
      
          toast.success("Job Posted Successfully");
          reset();
          navigate("/hr/dashboard");
        } catch (err) {
          console.error("Job creation failed:", err);
          toast.error("Error Posting Job");
        }
      };
      

  return (
    <div className="min-h-screen flex  justify-center items-center bg-gray-900 text-gray-100 p-6">
       <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-8 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </button>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className=" w-1/2 mx-auto bg-gray-800 shadow-2xl rounded-2xl p-8 space-y-6 border border-zinc-700"
      >
        <h2 className="text-2xl font-semibold text-center text-white">
          Post a New Job
        </h2>

        <div>
          <input
            {...register("title")}
            placeholder="Job Title"
            className="w-full bg-zinc-700 text-white p-3 rounded-lg border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.title && (
            <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <textarea
            {...register("description")}
            placeholder="Job Description"
            rows={4}
            className="w-full bg-zinc-700 text-white p-3 rounded-lg border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.description && (
            <p className="text-red-400 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <input
            {...register("requiredSkills")}
            placeholder="Required Skills (comma-separated)"
            className="w-full bg-zinc-700 text-white p-3 rounded-lg border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <input
            {...register("location")}
            placeholder="Location"
            className="w-full bg-zinc-700 text-white p-3 rounded-lg border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.location && (
            <p className="text-red-400 text-sm mt-1">
              {errors.location.message}
            </p>
          )}
        </div>

        <div className="flex gap-4">
          <input
            {...register("salaryMin")}
            placeholder="Min Salary"
            className="w-1/2 bg-zinc-700 text-white p-3 rounded-lg border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            {...register("salaryMax")}
            placeholder="Max Salary"
            className="w-1/2 bg-zinc-700 text-white p-3 rounded-lg border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {(errors.salaryMin || errors.salaryMax) && (
          <p className="text-red-400 text-sm">Salary must be numeric.</p>
        )}

        <div>
          <select
            {...register("employmentType")}
            className="w-full bg-zinc-700 text-white p-3 rounded-lg border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
            <option value="Temporary">Temporary</option>
          </select>
        </div>

        <div>
          <select
            {...register("applicationSource")}
            className="w-full bg-zinc-700 text-white p-3 rounded-lg border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Company Website">Company Website</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Google Form">Google Form</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all duration-200"
        >
          Post Job
        </button>
      </form>
    </div>
  );
};

export default JobForm;

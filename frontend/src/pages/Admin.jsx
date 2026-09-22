import { useState } from "react";
import { NavLink } from "react-router";
import Navbar from "../components/Navbar";
import axiosClient from "../utils/axiosClient";

const CARDS = [
  {
    title: "Create Problem",
    description: "Add a new coding problem with test cases, starter code, and reference solutions.",
    to: "/admin/create",
    color: "primary",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    title: "Update Problem",
    description: "Edit an existing problem's details, test cases, or reference solutions.",
    to: "/admin/update",
    color: "secondary",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    title: "Delete Problem",
    description: "Remove a problem and all associated submissions from the platform.",
    to: "/admin/delete",
    color: "error",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
  },
  {
    title: "Video Solutions",
    description: "Upload and manage video editorial solutions for problems via Cloudinary.",
    to: "/admin/video",
    color: "info",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 10l4.553-2.276A1 1 0 0121 8.677v6.646a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
      </svg>
    ),
  },
];

function Admin() {
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState(null);
  const [seedError, setSeedError] = useState(null);

  const handleSeedProblems = async () => {
    setSeeding(true);
    setSeedResult(null);
    setSeedError(null);
    try {
      const response = await axiosClient.post("/problem/seed");
      setSeedResult(response.data);
    } catch (err) {
      setSeedError(err.response?.data?.message || err.message || "Seeding failed");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <p className="text-sm font-medium text-base-content/40 uppercase tracking-widest mb-1">Control Panel</p>
            <h1 className="text-4xl font-bold gradient-text">Admin Dashboard</h1>
            <p className="mt-2 text-base-content/50">Manage problems, solutions, and platform features.</p>
          </div>
          <button
            onClick={handleSeedProblems}
            disabled={seeding}
            className="btn btn-secondary shadow-lg shadow-secondary/20 gap-2 shrink-0"
          >
            {seeding ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <span>⚡</span>
            )}
            <span>{seeding ? "Seeding Problems..." : "Seed 10+ Standard Problems"}</span>
          </button>
        </div>

        {/* Seed notification */}
        {seedResult && (
          <div className="alert alert-success shadow-lg mb-8 animate-fade-in flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="font-bold text-sm">{seedResult.message}</p>
                <p className="text-xs opacity-90">Total problems active on SolveIt: {seedResult.totalProblems}</p>
              </div>
            </div>
            <NavLink to="/problems" className="btn btn-sm btn-ghost bg-base-100/30">View Problems →</NavLink>
          </div>
        )}

        {seedError && (
          <div className="alert alert-error shadow-lg mb-8 animate-fade-in">
            <span>{seedError}</span>
          </div>
        )}

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 stagger-fade">
          {CARDS.map((card) => (
            <NavLink
              key={card.to}
              to={card.to}
              className={`glass-card rounded-2xl p-6 hover-glow group transition-all duration-300 hover:border-${card.color}/20 hover:bg-${card.color}/5 flex flex-col gap-4`}
            >
              <div className={`w-12 h-12 rounded-xl bg-${card.color}/10 text-${card.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                {card.icon}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-base-content group-hover:text-primary transition-colors duration-300">
                  {card.title}
                </h2>
                <p className="mt-1 text-sm text-base-content/50 leading-relaxed">{card.description}</p>
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium text-${card.color}/70 group-hover:text-${card.color} transition-colors duration-300 mt-auto`}>
                Open
                <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Admin;

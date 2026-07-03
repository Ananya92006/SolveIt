import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { useSelector } from "react-redux";
import axiosClient from "../utils/axiosClient";
import Navbar from "../components/Navbar";

function Home() {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats]     = useState({ total: 0, solved: 0, easy: 0, medium: 0, hard: 0, solvedEasy: 0, solvedMedium: 0, solvedHard: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [{ data: all }, { data: solvedData }] = await Promise.all([
          axiosClient.get("/problem/getAllProblem"),
          user ? axiosClient.get("/problem/problemSolvedByUser") : Promise.resolve({ data: null }),
        ]);
        const problems = Array.isArray(all) ? all : [];
        const solved = solvedData?.problemSolved ?? solvedData?.solvedProblems ?? [];
        const solvedArr = Array.isArray(solved) ? solved : [];
        const solvedIds = new Set(solvedArr.map((p) => p._id));

        setStats({
          total: problems.length,
          solved: solvedIds.size,
          easy:   problems.filter((p) => p.difficulty?.toLowerCase() === "easy").length,
          medium: problems.filter((p) => p.difficulty?.toLowerCase() === "medium").length,
          hard:   problems.filter((p) => p.difficulty?.toLowerCase() === "hard").length,
          solvedEasy:   problems.filter((p) => p.difficulty?.toLowerCase() === "easy" && solvedIds.has(p._id)).length,
          solvedMedium: problems.filter((p) => p.difficulty?.toLowerCase() === "medium" && solvedIds.has(p._id)).length,
          solvedHard:   problems.filter((p) => p.difficulty?.toLowerCase() === "hard" && solvedIds.has(p._id)).length,
        });
      } catch {
        /* keep defaults */
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const pct = stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0;

  const greetName = user?.firstName || "Coder";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* Hero */}
        <div className="relative overflow-hidden glass-card rounded-3xl p-8 sm:p-12 animate-slide-up">
          {/* Background glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-base-content/50 text-sm font-medium">{greeting},</p>
              <h1 className="text-3xl sm:text-4xl font-bold mt-1">
                <span className="gradient-text">{greetName}</span> 👋
              </h1>
              <p className="mt-3 text-base-content/60 max-w-lg leading-relaxed">
                Welcome back to <span className="font-semibold text-primary">SolveIt</span>. Keep building your problem-solving skills — consistency is key!
              </p>
            </div>
            <NavLink
              to="/problems"
              className="btn btn-primary shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              Start Solving
            </NavLink>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          {/* Progress Ring */}
          <div className="glass-card rounded-2xl p-6 hover-glow transition-all duration-300 flex flex-col items-center justify-center col-span-2 lg:col-span-1">
            <div className="radial-progress text-primary text-3xl font-bold" style={{ "--value": pct, "--size": "6rem", "--thickness": "6px" }} role="progressbar">
              {loading ? "—" : `${pct}%`}
            </div>
            <p className="text-xs text-base-content/50 mt-3 font-medium uppercase tracking-wider">Completed</p>
            <p className="text-base-content/70 text-sm mt-0.5">
              {loading ? "—" : `${stats.solved} / ${stats.total} problems`}
            </p>
          </div>

          {/* Easy */}
          <div className="glass-card rounded-2xl p-6 hover-glow transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-success" />
              <span className="text-xs text-base-content/50 font-medium uppercase tracking-wider">Easy</span>
            </div>
            <p className="text-3xl font-bold text-success">{loading ? "—" : stats.solvedEasy}</p>
            <p className="text-xs text-base-content/40 mt-1">of {stats.easy} problems</p>
            <progress className="progress progress-success w-full h-1.5 mt-3" value={stats.solvedEasy} max={stats.easy || 1} />
          </div>

          {/* Medium */}
          <div className="glass-card rounded-2xl p-6 hover-glow transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-warning" />
              <span className="text-xs text-base-content/50 font-medium uppercase tracking-wider">Medium</span>
            </div>
            <p className="text-3xl font-bold text-warning">{loading ? "—" : stats.solvedMedium}</p>
            <p className="text-xs text-base-content/40 mt-1">of {stats.medium} problems</p>
            <progress className="progress progress-warning w-full h-1.5 mt-3" value={stats.solvedMedium} max={stats.medium || 1} />
          </div>

          {/* Hard */}
          <div className="glass-card rounded-2xl p-6 hover-glow transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-error" />
              <span className="text-xs text-base-content/50 font-medium uppercase tracking-wider">Hard</span>
            </div>
            <p className="text-3xl font-bold text-error">{loading ? "—" : stats.solvedHard}</p>
            <p className="text-xs text-base-content/40 mt-1">of {stats.hard} problems</p>
            <progress className="progress progress-error w-full h-1.5 mt-3" value={stats.solvedHard} max={stats.hard || 1} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
          <NavLink to="/problems" className="glass-card rounded-2xl p-6 hover-glow group transition-all duration-300 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-base-content group-hover:text-primary transition-colors">Browse Problems</p>
              <p className="text-xs text-base-content/50">{stats.total} problems available</p>
            </div>
          </NavLink>

          <NavLink to="/problems" className="glass-card rounded-2xl p-6 hover-glow group transition-all duration-300 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-base-content group-hover:text-success transition-colors">Quick Practice</p>
              <p className="text-xs text-base-content/50">Jump into a random problem</p>
            </div>
          </NavLink>

          <NavLink to="/problems" className="glass-card rounded-2xl p-6 hover-glow group transition-all duration-300 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-base-content group-hover:text-secondary transition-colors">Your Progress</p>
              <p className="text-xs text-base-content/50">{stats.solved} problems solved</p>
            </div>
          </NavLink>
        </div>

        {/* Footer tagline */}
        <p className="text-center text-xs text-base-content/20 pt-4">
          SolveIt — Code. Solve. Improve.
        </p>
      </div>
    </div>
  );
}

export default Home;

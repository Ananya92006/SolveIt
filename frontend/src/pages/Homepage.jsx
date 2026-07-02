import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { useSelector } from "react-redux";
import axiosClient from "../utils/axiosClient";
import Navbar from "../components/Navbar";

const DIFFICULTY_CONFIG = {
  easy:   { label: "Easy",   cls: "badge-success" },
  medium: { label: "Medium", cls: "badge-warning" },
  hard:   { label: "Hard",   cls: "badge-error"   },
};

const TAG_OPTIONS = ["array", "linkedList", "graph", "dp"];

function Homepage() {
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems]           = useState([]);
  const [solvedIds, setSolvedIds]         = useState(new Set());
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [filters, setFilters]             = useState({ difficulty: "all", tag: "all", status: "all" });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [{ data: allProblems }, { data: solvedData }] = await Promise.all([
          axiosClient.get("/problem/getAllProblem"),
          user ? axiosClient.get("/problem/problemSolvedByUser") : Promise.resolve({ data: null }),
        ]);
        setProblems(Array.isArray(allProblems) ? allProblems : []);
        const solved = solvedData?.problemSolved ?? solvedData?.solvedProblems ?? [];
        setSolvedIds(new Set(Array.isArray(solved) ? solved.map((p) => p._id) : []));
      } catch {
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  const filtered = problems.filter((p) => {
    const diff = p.difficulty?.toLowerCase();
    const matchDiff   = filters.difficulty === "all" || diff === filters.difficulty;
    const matchTag    = filters.tag        === "all" || p.tags === filters.tag;
    const matchStatus =
      filters.status === "all" ||
      (filters.status === "solved"   && solvedIds.has(p._id)) ||
      (filters.status === "unsolved" && !solvedIds.has(p._id));
    const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase());
    return matchDiff && matchTag && matchStatus && matchSearch;
  });

  // Stats
  const total    = problems.length;
  const solved   = solvedIds.size;
  const easyC    = problems.filter((p) => p.difficulty?.toLowerCase() === "easy").length;
  const mediumC  = problems.filter((p) => p.difficulty?.toLowerCase() === "medium").length;
  const hardC    = problems.filter((p) => p.difficulty?.toLowerCase() === "hard").length;

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 animate-fade-in">
          {[
            { label: "Total Problems", value: total,   color: "text-base-content" },
            { label: "Solved",         value: solved,  color: "text-success" },
            { label: "Easy",           value: easyC,   color: "text-success" },
            { label: "Medium",         value: mediumC, color: "text-warning" },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-card rounded-xl p-4 hover-glow transition-all duration-300">
              <p className="text-xs text-base-content/50 font-medium uppercase tracking-wider">{label}</p>
              <p className={`text-3xl font-bold mt-1 ${color}`}>{loading ? "—" : value}</p>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search problems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-bordered w-full pl-10 bg-base-300/50 focus:bg-base-300 transition-all duration-300 focus:input-primary"
            />
          </div>

          <select
            className="select select-bordered bg-base-300/50 focus:bg-base-300 transition-all duration-300"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="all">All Status</option>
            <option value="solved">Solved</option>
            <option value="unsolved">Unsolved</option>
          </select>

          <select
            className="select select-bordered bg-base-300/50 focus:bg-base-300 transition-all duration-300"
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
          >
            <option value="all">All Difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            className="select select-bordered bg-base-300/50 focus:bg-base-300 transition-all duration-300"
            value={filters.tag}
            onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
          >
            <option value="all">All Topics</option>
            {TAG_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Problems Table */}
        <div className="glass-card rounded-2xl overflow-hidden shadow-xl animate-fade-in">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <span className="loading loading-dots loading-md text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <svg className="w-12 h-12 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-base-content/40 font-medium">No problems match your filters</p>
            </div>
          ) : (
            <table className="table table-pin-rows w-full">
              <thead>
                <tr className="bg-base-300/60 text-base-content/60 text-xs uppercase tracking-wider">
                  <th className="w-12 font-medium py-4">#</th>
                  <th className="font-medium py-4">Title</th>
                  <th className="font-medium py-4">Difficulty</th>
                  <th className="font-medium py-4 hidden sm:table-cell">Topic</th>
                  <th className="font-medium py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="stagger-fade">
                {filtered.map((problem, idx) => {
                  const diff = problem.difficulty?.toLowerCase();
                  const cfg  = DIFFICULTY_CONFIG[diff] || { label: diff, cls: "badge-neutral" };
                  const isSolved = solvedIds.has(problem._id);
                  return (
                    <tr
                      key={problem._id}
                      className="hover:bg-base-content/5 transition-colors duration-200 border-base-content/5"
                    >
                      <td className="text-base-content/30 font-mono text-sm py-4">{idx + 1}</td>
                      <td className="py-4">
                        <NavLink
                          to={`/problem/${problem._id}`}
                          className="font-medium text-base-content hover:text-primary transition-colors duration-200"
                        >
                          {problem.title}
                        </NavLink>
                      </td>
                      <td className="py-4">
                        <span className={`badge badge-sm ${cfg.cls} badge-outline`}>{cfg.label}</span>
                      </td>
                      <td className="py-4 hidden sm:table-cell">
                        <span className="badge badge-sm badge-ghost text-base-content/60">{problem.tags}</span>
                      </td>
                      <td className="py-4 text-center">
                        {isSolved ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-success/15">
                            <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-base-content/5">
                            <svg className="w-3 h-3 text-base-content/20" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="6" />
                            </svg>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <p className="text-center text-xs text-base-content/30 mt-4">
            Showing {filtered.length} of {total} problems · {solved} solved
          </p>
        )}
      </div>
    </div>
  );
}

export default Homepage;

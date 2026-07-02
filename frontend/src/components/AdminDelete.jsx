import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import axiosClient from "../utils/axiosClient";
import Navbar from "./Navbar";

function AdminDelete() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting]   = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    axiosClient
      .get("/problem/getAllProblem")
      .then(({ data }) => setProblems(Array.isArray(data) ? data : []))
      .catch(() => showToast("Failed to load problems", "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!confirmId) return;
    setDeleting(true);
    try {
      await axiosClient.delete(`/problem/delete/${confirmId}`);
      setProblems((prev) => prev.filter((p) => p._id !== confirmId));
      showToast("Problem deleted successfully");
    } catch {
      showToast("Failed to delete problem", "error");
    } finally {
      setDeleting(false);
      setConfirmId(null);
    }
  };

  const diffCls = (d = "") => {
    const l = d.toLowerCase();
    if (l === "easy")   return "badge-success";
    if (l === "medium") return "badge-warning";
    if (l === "hard")   return "badge-error";
    return "badge-neutral";
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      {/* Toast */}
      {toast && (
        <div className="toast toast-end z-50">
          <div className={`alert ${toast.type === "error" ? "alert-error" : "alert-success"} shadow-lg text-sm`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmId && (
        <div className="modal modal-open">
          <div className="modal-box glass-card border border-base-content/10 rounded-2xl">
            <h3 className="font-bold text-lg text-error">Delete Problem?</h3>
            <p className="py-4 text-base-content/70 text-sm">
              This will permanently delete the problem and all its associated submissions. This action cannot be undone.
            </p>
            <div className="modal-action gap-3">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setConfirmId(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-error btn-sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? <span className="loading loading-spinner loading-xs" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 animate-fade-in">
          <NavLink to="/admin" className="text-xs text-base-content/40 hover:text-primary transition-colors flex items-center gap-1 mb-3">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Admin Dashboard
          </NavLink>
          <h1 className="text-3xl font-bold gradient-text">Delete Problems</h1>
          <p className="mt-1 text-base-content/50 text-sm">{problems.length} problems in total</p>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden shadow-xl animate-fade-in">
          {loading ? (
            <div className="flex justify-center py-20">
              <span className="loading loading-dots loading-md text-primary" />
            </div>
          ) : problems.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-2">
              <p className="text-base-content/40">No problems found</p>
            </div>
          ) : (
            <table className="table w-full">
              <thead>
                <tr className="bg-base-300/60 text-xs uppercase tracking-wider text-base-content/60">
                  <th className="py-4 font-medium">#</th>
                  <th className="py-4 font-medium">Title</th>
                  <th className="py-4 font-medium">Difficulty</th>
                  <th className="py-4 font-medium hidden sm:table-cell">Topic</th>
                  <th className="py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="stagger-fade">
                {problems.map((p, i) => (
                  <tr key={p._id} className="hover:bg-base-content/5 transition-colors duration-200 border-base-content/5">
                    <td className="text-base-content/30 font-mono text-sm py-4">{i + 1}</td>
                    <td className="py-4 font-medium">{p.title}</td>
                    <td className="py-4">
                      <span className={`badge badge-sm ${diffCls(p.difficulty)} badge-outline`}>{p.difficulty}</span>
                    </td>
                    <td className="py-4 hidden sm:table-cell">
                      <span className="badge badge-sm badge-ghost text-base-content/60">{p.tags}</span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => setConfirmId(p._id)}
                        className="btn btn-error btn-xs btn-outline hover:bg-error transition-all duration-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDelete;
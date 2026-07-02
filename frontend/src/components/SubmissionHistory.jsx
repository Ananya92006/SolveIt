import { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";

const STATUS_CONFIG = {
  accepted:   { label: "Accepted",  cls: "badge-success" },
  wrong:      { label: "Wrong",     cls: "badge-error"   },
  error:      { label: "Error",     cls: "badge-warning" },
  pending:    { label: "Pending",   cls: "badge-neutral" },
};

function SubmissionHistory({ problemId }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState(null);
  const [copied, setCopied]           = useState(false);

  useEffect(() => {
    if (!problemId) return;
    axiosClient
      .get(`/problem/submittedProblem/${problemId}`)
      .then(({ data }) => setSubmissions(Array.isArray(data) ? data : []))
      .catch(() => setSubmissions([]))
      .finally(() => setLoading(false));
  }, [problemId]);

  const copyCode = () => {
    if (!selected?.code) return;
    navigator.clipboard.writeText(selected.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-dots loading-md text-primary" />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <svg className="w-10 h-10 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-base-content/40 text-sm">No submissions yet</p>
        <p className="text-base-content/30 text-xs">Submit your solution to see results here</p>
      </div>
    );
  }

  return (
    <>
      {/* Code view modal */}
      {selected && (
        <div className="modal modal-open">
          <div className="modal-box glass-card border border-base-content/10 rounded-2xl max-w-3xl w-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">Submission Code</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge badge-sm ${STATUS_CONFIG[selected.status]?.cls || "badge-neutral"}`}>
                    {STATUS_CONFIG[selected.status]?.label || selected.status}
                  </span>
                  <span className="text-xs text-base-content/50 capitalize">{selected.language}</span>
                  {selected.runtime > 0 && (
                    <span className="text-xs text-base-content/50">{selected.runtime} ms</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={copyCode} className="btn btn-ghost btn-sm gap-1">
                  {copied ? (
                    <>
                      <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
                <button onClick={() => setSelected(null)} className="btn btn-ghost btn-sm">✕</button>
              </div>
            </div>

            {selected.errorMessage && (
              <div className="alert alert-error text-sm mb-4 py-2">
                <span className="font-mono">{selected.errorMessage}</span>
              </div>
            )}

            <pre className="bg-base-300 rounded-xl p-4 overflow-auto max-h-96 text-sm font-mono text-base-content/90 leading-relaxed">
              <code>{selected.code}</code>
            </pre>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="table table-sm w-full">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-base-content/50">
              <th className="py-3 font-medium">Status</th>
              <th className="py-3 font-medium">Language</th>
              <th className="py-3 font-medium">Runtime</th>
              <th className="py-3 font-medium hidden sm:table-cell">Tests</th>
              <th className="py-3 font-medium hidden sm:table-cell">Date</th>
              <th className="py-3 font-medium text-right">Code</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => {
              const cfg = STATUS_CONFIG[s.status] || { label: s.status, cls: "badge-neutral" };
              return (
                <tr key={s._id} className="hover:bg-base-content/5 transition-colors duration-200 border-base-content/5">
                  <td className="py-3">
                    <span className={`badge badge-sm ${cfg.cls}`}>{cfg.label}</span>
                  </td>
                  <td className="py-3 text-sm capitalize text-base-content/70">{s.language}</td>
                  <td className="py-3 text-sm font-mono text-base-content/60">
                    {s.runtime > 0 ? `${s.runtime} ms` : "—"}
                  </td>
                  <td className="py-3 text-sm text-base-content/60 hidden sm:table-cell">
                    {s.testCasesTotal > 0 ? `${s.testCasesPassed}/${s.testCasesTotal}` : "—"}
                  </td>
                  <td className="py-3 text-xs text-base-content/40 hidden sm:table-cell">{formatDate(s.createdAt)}</td>
                  <td className="py-3 text-right">
                    <button onClick={() => setSelected(s)} className="btn btn-ghost btn-xs">View</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default SubmissionHistory;
import { useEffect, useState, useCallback } from "react";
import { useParams, NavLink } from "react-router";
import Editor from "@monaco-editor/react";
import axiosClient from "../utils/axiosClient";
import Navbar from "../components/Navbar";
import SubmissionHistory from "../components/SubmissionHistory";

const LANG_MAP = { javascript: "javascript", "c++": "cpp", java: "java" };
const DIFF_CONFIG = {
  easy:   { label: "Easy",   cls: "badge-success" },
  medium: { label: "Medium", cls: "badge-warning" },
  hard:   { label: "Hard",   cls: "badge-error"   },
};

function ProblemPage() {
  const { problemId } = useParams();

  const [problem, setProblem]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [language, setLanguage]       = useState("javascript");
  const [code, setCode]               = useState("");

  const [leftTab, setLeftTab]         = useState("description"); // description | solutions | submissions
  const [rightTab, setRightTab]       = useState("testcase");    // testcase | result

  const [running, setRunning]         = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [runResult, setRunResult]     = useState(null);
  const [submitResult, setSubmitResult] = useState(null);

  // Fetch problem on mount
  useEffect(() => {
    axiosClient
      .get(`/problem/getProblemById/${problemId}`)
      .then(({ data }) => {
        setProblem(data);
        const starter = data.startCode?.find((s) => s.language === "javascript")?.initialCode || "";
        setCode(starter);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [problemId]);

  // When language changes, load starter code
  const handleLanguageChange = useCallback(
    (lang) => {
      setLanguage(lang);
      if (!problem) return;
      const starter = problem.startCode?.find((s) => s.language === lang)?.initialCode || "";
      setCode(starter);
    },
    [problem]
  );

  const handleRun = async () => {
    setRunning(true);
    setRightTab("testcase");
    setRunResult(null);
    try {
      const { data } = await axiosClient.post(`/submission/run/${problemId}`, { code, language });
      setRunResult(data);
    } catch (err) {
      setRunResult({ success: false, error: err.response?.data?.message || "An error occurred", testCases: [] });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setRightTab("result");
    setSubmitResult(null);
    try {
      const { data } = await axiosClient.post(`/submission/submit/${problemId}`, { code, language });
      setSubmitResult(data);
    } catch (err) {
      setSubmitResult({ accepted: false, error: err.response?.data?.message || "Submission failed" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center gap-4">
        <span className="text-3xl font-bold font-mono gradient-text">⟨/⟩</span>
        <span className="loading loading-dots loading-md text-primary" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center gap-4">
        <p className="text-base-content/50">Problem not found.</p>
        <NavLink to="/" className="btn btn-primary btn-sm">Back to Problems</NavLink>
      </div>
    );
  }

  const diff = problem.difficulty?.toLowerCase();
  const diffCfg = DIFF_CONFIG[diff] || { label: problem.difficulty, cls: "badge-neutral" };

  return (
    <div className="h-screen flex flex-col bg-base-200 overflow-hidden">
      <Navbar />

      {/* Main Split Layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* ─── LEFT PANEL ─── */}
        <div className="w-[45%] flex flex-col border-r border-base-content/10 overflow-hidden">
          {/* Left Tabs */}
          <div className="flex border-b border-base-content/10 bg-base-100/50 px-2 pt-2 gap-1 shrink-0">
            {["description", "solutions", "submissions"].map((tab) => (
              <button
                key={tab}
                onClick={() => setLeftTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg capitalize transition-all duration-200 ${
                  leftTab === tab
                    ? "bg-base-200 text-primary border-b-2 border-primary"
                    : "text-base-content/50 hover:text-base-content"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Left Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">

            {/* ── Description ── */}
            {leftTab === "description" && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <h1 className="text-xl font-bold text-base-content leading-tight">{problem.title}</h1>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`badge badge-sm ${diffCfg.cls} badge-outline`}>{diffCfg.label}</span>
                    <span className="badge badge-sm badge-ghost text-base-content/60">{problem.tags}</span>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none text-base-content/80 leading-relaxed whitespace-pre-wrap text-sm">
                  {problem.description}
                </div>

                {problem.visibleTestCases?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-base-content/70 uppercase tracking-wider">Examples</h3>
                    {problem.visibleTestCases.map((tc, i) => (
                      <div key={i} className="bg-base-300/40 rounded-xl p-4 space-y-2 text-sm font-mono">
                        <div>
                          <span className="text-base-content/50 font-sans font-medium text-xs uppercase tracking-wider">Input</span>
                          <pre className="mt-1 text-base-content/80 whitespace-pre-wrap">{tc.input}</pre>
                        </div>
                        <div>
                          <span className="text-base-content/50 font-sans font-medium text-xs uppercase tracking-wider">Output</span>
                          <pre className="mt-1 text-base-content/80 whitespace-pre-wrap">{tc.output}</pre>
                        </div>
                        {tc.explaination && (
                          <div>
                            <span className="text-base-content/50 font-sans font-medium text-xs uppercase tracking-wider">Explanation</span>
                            <p className="mt-1 text-base-content/60 font-sans text-xs leading-relaxed">{tc.explaination}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Solutions ── */}
            {leftTab === "solutions" && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="font-semibold text-sm text-base-content/70 uppercase tracking-wider">Reference Solutions</h2>
                {problem.referenceSolution?.map((sol, i) => (
                  <div key={i} className="space-y-2">
                    <span className="badge badge-sm badge-ghost capitalize">{sol.language}</span>
                    <pre className="bg-base-300/40 rounded-xl p-4 overflow-x-auto text-sm font-mono text-base-content/80 whitespace-pre-wrap leading-relaxed">
                      {sol.completeCode}
                    </pre>
                  </div>
                ))}
                {(!problem.referenceSolution || problem.referenceSolution.length === 0) && (
                  <p className="text-base-content/40 text-sm">No reference solutions available.</p>
                )}
              </div>
            )}

            {/* ── Submissions ── */}
            {leftTab === "submissions" && (
              <div className="animate-fade-in">
                <SubmissionHistory problemId={problemId} />
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT PANEL ─── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor Toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-base-100/50 border-b border-base-content/10 shrink-0">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="select select-bordered select-sm bg-base-300/50 text-sm w-36"
            >
              <option value="javascript">JavaScript</option>
              <option value="c++">C++</option>
              <option value="java">Java</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleRun}
                disabled={running || submitting}
                className="btn btn-ghost btn-sm border border-base-content/20 hover:border-primary/50 transition-all duration-300"
              >
                {running ? <span className="loading loading-spinner loading-xs" /> : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                Run
              </button>
              <button
                onClick={handleSubmit}
                disabled={running || submitting}
                className="btn btn-primary btn-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
              >
                {submitting ? <span className="loading loading-spinner loading-xs" /> : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                Submit
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={LANG_MAP[language] || language}
              value={code}
              onChange={(val) => setCode(val || "")}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                renderLineHighlight: "all",
                wordWrap: "on",
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontLigatures: true,
                cursorBlinking: "smooth",
                smoothScrolling: true,
                tabSize: 2,
              }}
            />
          </div>

          {/* Results Panel */}
          <div className="h-52 flex flex-col border-t border-base-content/10 bg-base-100/50 shrink-0">
            {/* Result Tabs */}
            <div className="flex border-b border-base-content/10 px-2 pt-2 gap-1 shrink-0">
              {["testcase", "result"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setRightTab(tab)}
                  className={`px-4 py-1.5 text-xs font-medium rounded-t-lg capitalize transition-all duration-200 ${
                    rightTab === tab
                      ? "bg-base-200 text-primary border-b-2 border-primary"
                      : "text-base-content/50 hover:text-base-content"
                  }`}
                >
                  {tab === "testcase" ? "Test Cases" : "Result"}
                </button>
              ))}
            </div>

            {/* Result Content */}
            <div className="flex-1 overflow-y-auto p-3">

              {/* Run Results */}
              {rightTab === "testcase" && (
                <div className="text-sm">
                  {!runResult && !running && (
                    <p className="text-base-content/30 text-xs mt-2">Run your code to see test case results</p>
                  )}
                  {running && (
                    <div className="flex items-center gap-2 text-base-content/50 text-xs mt-2">
                      <span className="loading loading-spinner loading-xs" /> Running test cases…
                    </div>
                  )}
                  {runResult && !running && (
                    <div className="space-y-2">
                      {runResult.error && (
                        <div className="alert alert-error py-2 text-xs">
                          <span className="font-mono">{runResult.error}</span>
                        </div>
                      )}
                      {Array.isArray(runResult.testCases) && runResult.testCases.map((tc, i) => {
                        const passed = tc.status_id === 3;
                        return (
                          <div key={i} className={`flex items-start gap-3 p-2 rounded-lg text-xs ${passed ? "bg-success/10" : "bg-error/10"}`}>
                            <span className={`font-semibold shrink-0 ${passed ? "text-success" : "text-error"}`}>
                              {passed ? "✓" : "✗"} Case {i + 1}
                            </span>
                            <div className="font-mono space-y-0.5 text-base-content/70">
                              {tc.stdout && <div><span className="text-base-content/40">Output: </span>{tc.stdout.trim()}</div>}
                              {tc.expected_output && <div><span className="text-base-content/40">Expected: </span>{tc.expected_output.trim()}</div>}
                              {tc.stderr && <div className="text-error">{tc.stderr.trim()}</div>}
                            </div>
                          </div>
                        );
                      })}
                      {runResult.runtime > 0 && (
                        <p className="text-xs text-base-content/30 mt-1">{runResult.runtime} ms</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Submit Results */}
              {rightTab === "result" && (
                <div className="text-sm">
                  {!submitResult && !submitting && (
                    <p className="text-base-content/30 text-xs mt-2">Submit your code to see the final result</p>
                  )}
                  {submitting && (
                    <div className="flex items-center gap-2 text-base-content/50 text-xs mt-2">
                      <span className="loading loading-spinner loading-xs" /> Judging submission…
                    </div>
                  )}
                  {submitResult && !submitting && (
                    <div className="space-y-2">
                      {submitResult.error && (
                        <div className="alert alert-error py-2 text-xs">
                          <span className="font-mono">{submitResult.error}</span>
                        </div>
                      )}
                      {!submitResult.error && (
                        <div className={`flex items-center gap-3 p-3 rounded-xl ${submitResult.accepted ? "bg-success/10 border border-success/20" : "bg-error/10 border border-error/20"}`}>
                          <span className={`text-2xl ${submitResult.accepted ? "text-success" : "text-error"}`}>
                            {submitResult.accepted ? "🎉" : "✗"}
                          </span>
                          <div>
                            <p className={`font-bold text-sm ${submitResult.accepted ? "text-success" : "text-error"}`}>
                              {submitResult.accepted ? "Accepted" : "Wrong Answer"}
                            </p>
                            <p className="text-xs text-base-content/50">
                              {submitResult.passedTestCases ?? 0} / {submitResult.totalTestCases ?? 0} test cases passed
                              {submitResult.runtime > 0 && ` · ${submitResult.runtime} ms`}
                              {submitResult.memory > 0 && ` · ${submitResult.memory} KB`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProblemPage;
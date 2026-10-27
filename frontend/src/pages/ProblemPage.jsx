import { useEffect, useState, useCallback } from "react";
import { useParams, NavLink } from "react-router";
import { useSelector } from 'react-redux';
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

  const [leftTab, setLeftTab]         = useState("description"); // description | hints | notes | solutions | submissions
  const [rightTab, setRightTab]       = useState("testcase");    // testcase | result

  const [running, setRunning]         = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [runResult, setRunResult]     = useState(null);
  const [submitResult, setSubmitResult] = useState(null);

  // New features: Bookmark & Notes
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userNote, setUserNote]       = useState("");
  const [savingNote, setSavingNote]   = useState(false);
  const [noteStatus, setNoteStatus]   = useState("");

  // Discussions
  const [discussions, setDiscussions] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [loadingDiscussions, setLoadingDiscussions] = useState(false);
  const [postingComment, setPostingComment] = useState(false);

  // Video
  const [videoData, setVideoData] = useState(null);
  const [loadingVideo, setLoadingVideo] = useState(false);

  const { user } = useSelector((state) => state.auth);

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

    // Fetch user bookmark state & note
    axiosClient.get("/problem/bookmark/list").then(({ data }) => {
      if (Array.isArray(data)) {
        setIsBookmarked(data.some(b => b._id === problemId));
      }
    }).catch(() => {});

    axiosClient.get(`/problem/note/get/${problemId}`).then(({ data }) => {
      if (data?.content) setUserNote(data.content);
    }).catch(() => {});
  }, [problemId]);

  const handleToggleBookmark = async () => {
    try {
      const { data } = await axiosClient.post("/problem/bookmark/toggle", { problemId });
      setIsBookmarked(data.isBookmarked);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNote = async () => {
    setSavingNote(true);
    setNoteStatus("");
    try {
      await axiosClient.post("/problem/note/save", { problemId, content: userNote });
      setNoteStatus("Note saved!");
      setTimeout(() => setNoteStatus(""), 3000);
    } catch (err) {
      setNoteStatus("Failed to save note");
    } finally {
      setSavingNote(false);
    }
  };

  const fetchDiscussions = useCallback(async () => {
    setLoadingDiscussions(true);
    try {
      const { data } = await axiosClient.get(`/discussion/${problemId}`);
      setDiscussions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDiscussions(false);
    }
  }, [problemId]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setPostingComment(true);
    try {
      await axiosClient.post(`/discussion/${problemId}`, { content: newComment.trim() });
      setNewComment('');
      fetchDiscussions();
    } catch (err) {
      console.error(err);
    } finally {
      setPostingComment(false);
    }
  };

  const handlePostReply = async (parentId) => {
    if (!replyContent.trim()) return;
    try {
      await axiosClient.post(`/discussion/${problemId}`, { content: replyContent.trim(), parentId });
      setReplyContent('');
      setReplyTo(null);
      fetchDiscussions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleVote = async (commentId, type) => {
    try {
      await axiosClient.post(`/discussion/vote/${commentId}`, { type });
      fetchDiscussions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axiosClient.delete(`/discussion/${commentId}`);
      fetchDiscussions();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVideo = useCallback(async () => {
    setLoadingVideo(true);
    try {
      const { data } = await axiosClient.get(`/video/problem/${problemId}`);
      setVideoData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVideo(false);
    }
  }, [problemId]);

  useEffect(() => {
    if (leftTab === 'discussions') fetchDiscussions();
    if (leftTab === 'video') fetchVideo();
  }, [leftTab, fetchDiscussions, fetchVideo]);

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
          <div className="flex border-b border-base-content/10 bg-base-100/50 px-2 pt-2 gap-1 shrink-0 overflow-x-auto">
            {["description", "hints", "notes", "solutions", "submissions", "discussions", "video"].map((tab) => (
              <button
                key={tab}
                onClick={() => setLeftTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg capitalize transition-all duration-200 flex items-center gap-1.5 shrink-0 ${
                  leftTab === tab
                    ? "bg-base-200 text-primary border-b-2 border-primary font-semibold"
                    : "text-base-content/50 hover:text-base-content"
                }`}
              >
                {tab === "hints" && <span>💡</span>}
                {tab === "notes" && <span>📝</span>}
                {tab === "discussions" && <span>💬</span>}
                {tab === "video" && <span>🎥</span>}
                {tab}
              </button>
            ))}
          </div>

          {/* Left Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">

            {/* ── Description ── */}
            {leftTab === "description" && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-bold text-base-content leading-tight">{problem.title}</h1>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`badge badge-sm ${diffCfg.cls} badge-outline`}>{diffCfg.label}</span>
                      <span className="badge badge-sm badge-ghost text-base-content/60">{problem.tags}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleToggleBookmark}
                    className={`btn btn-circle btn-sm ${isBookmarked ? "btn-warning text-warning-content" : "btn-ghost text-base-content/40 hover:text-warning"}`}
                    title={isBookmarked ? "Remove Bookmark" : "Bookmark Problem"}
                  >
                    {isBookmarked ? "★" : "☆"}
                  </button>
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

            {/* ── Notes ── */}
            {leftTab === "notes" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-base text-base-content flex items-center gap-2">
                    <span>📝</span> Personal Study Notes
                  </h2>
                  {noteStatus && <span className="text-xs text-success font-semibold animate-fade-in">{noteStatus}</span>}
                </div>

                <textarea
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  placeholder="Write your key takeaways, edge case reminders, or approach notes here..."
                  className="textarea textarea-bordered w-full h-64 bg-base-300/50 focus:bg-base-300 text-sm leading-relaxed"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNote}
                    disabled={savingNote}
                    className="btn btn-primary btn-sm gap-2"
                  >
                    {savingNote ? <span className="loading loading-spinner loading-xs" /> : "Save Note"}
                  </button>
                </div>
              </div>
            )}

            {/* ── AI Hints & Strategy ── */}
            {leftTab === "hints" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-base text-base-content flex items-center gap-2">
                    <span>💡</span> Solution Hints & Strategy
                  </h2>
                  <span className="badge badge-primary badge-outline text-xs">AI Guided</span>
                </div>

                <div className="glass-card p-4 rounded-xl space-y-3 border-l-4 border-l-primary">
                  <h3 className="font-semibold text-sm text-primary flex items-center gap-1.5">
                    <span>🧠</span> Core Intuition
                  </h3>
                  <p className="text-xs text-base-content/80 leading-relaxed">
                    Think about pattern requirements for <strong>{problem.tags || "this topic"}</strong>. Can you optimize brute force search from O(N²) down to O(N) or O(N log N) using an auxiliary hash table, two pointers, or stack?
                  </p>
                </div>

                <div className="glass-card p-4 rounded-xl space-y-3 border-l-4 border-l-secondary">
                  <h3 className="font-semibold text-sm text-secondary flex items-center gap-1.5">
                    <span>⚡</span> Key Data Structure & Algorithm
                  </h3>
                  <ul className="text-xs text-base-content/80 space-y-1 list-disc list-inside">
                    <li><strong>Primary Technique:</strong> {problem.tags === "array" ? "Hash Map or Two Pointers" : problem.tags === "string" ? "Frequency Array or Two Pointers" : problem.tags === "stack" ? "Monotonic / LIFO Stack" : problem.tags === "dp" ? "Dynamic Programming Array / Memoization" : "Optimal Traversal"}</li>
                    <li><strong>Space-Time Target:</strong> Time O(N), Space O(N) or O(1).</li>
                  </ul>
                </div>

                <div className="glass-card p-4 rounded-xl space-y-3 border-l-4 border-l-accent">
                  <h3 className="font-semibold text-sm text-accent flex items-center gap-1.5">
                    <span>📝</span> Step-by-Step Approach
                  </h3>
                  <ol className="text-xs text-base-content/80 space-y-2 list-decimal list-inside leading-relaxed">
                    <li>Initialize your data structure or pointers to keep track of state.</li>
                    <li>Iterate through the input items sequentially. Check edge cases like empty inputs or single elements.</li>
                    <li>Compute required target value or state transition at each step.</li>
                    <li>Return the computed result string, array, or boolean matching expected output.</li>
                  </ol>
                </div>
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

            {/* ── Discussions ── */}
            {leftTab === "discussions" && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="font-semibold text-sm text-base-content/70 uppercase tracking-wider flex items-center gap-2">
                  💬 Discussions ({discussions.length})
                </h2>

                {/* New comment input */}
                <div className="flex gap-2">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your approach or ask a question..."
                    className="textarea textarea-bordered flex-1 bg-base-300/50 text-sm min-h-[80px]"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handlePostComment}
                    disabled={postingComment || !newComment.trim()}
                    className="btn btn-primary btn-sm gap-2"
                  >
                    {postingComment ? <span className="loading loading-spinner loading-xs" /> : "Post Comment"}
                  </button>
                </div>

                {/* Comments list */}
                {loadingDiscussions ? (
                  <div className="flex justify-center py-8"><span className="loading loading-dots loading-md text-primary" /></div>
                ) : discussions.length === 0 ? (
                  <div className="text-center py-8 text-base-content/40">
                    <p className="text-lg">💬</p>
                    <p className="text-sm">No discussions yet. Be the first to share!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {discussions.map((comment) => (
                      <div key={comment._id} className="glass-card rounded-xl p-4 space-y-3">
                        {/* Comment header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                              <span className="text-xs font-bold text-primary-content">{comment.userId?.firstName?.charAt(0)?.toUpperCase() || 'U'}</span>
                            </div>
                            <span className="font-medium text-sm text-base-content">{comment.userId?.firstName || 'User'}</span>
                            <span className="text-xs text-base-content/30">{new Date(comment.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {/* Upvote */}
                            <button onClick={() => handleVote(comment._id, 'upvote')} className="btn btn-ghost btn-xs gap-1 text-base-content/50 hover:text-success">
                              ▲ {comment.upvotes?.length || 0}
                            </button>
                            {/* Downvote */}
                            <button onClick={() => handleVote(comment._id, 'downvote')} className="btn btn-ghost btn-xs gap-1 text-base-content/50 hover:text-error">
                              ▼ {comment.downvotes?.length || 0}
                            </button>
                            {/* Delete (own comment or admin) */}
                            {(comment.userId?._id === user?._id || user?.role === 'admin') && (
                              <button onClick={() => handleDeleteComment(comment._id)} className="btn btn-ghost btn-xs text-error/50 hover:text-error">✕</button>
                            )}
                          </div>
                        </div>

                        {/* Comment content */}
                        <p className="text-sm text-base-content/80 leading-relaxed whitespace-pre-wrap">{comment.content}</p>

                        {/* Reply button */}
                        <button
                          onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)}
                          className="btn btn-ghost btn-xs text-base-content/40 hover:text-primary"
                        >
                          💬 Reply ({comment.replies?.length || 0})
                        </button>

                        {/* Replies */}
                        {comment.replies?.length > 0 && (
                          <div className="ml-6 space-y-2 border-l-2 border-base-content/10 pl-4">
                            {comment.replies.map((reply) => (
                              <div key={reply._id} className="bg-base-300/30 rounded-lg p-3 space-y-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                                      <span className="text-[10px] font-bold text-white">{reply.userId?.firstName?.charAt(0)?.toUpperCase() || 'U'}</span>
                                    </div>
                                    <span className="font-medium text-xs text-base-content">{reply.userId?.firstName || 'User'}</span>
                                    <span className="text-[10px] text-base-content/30">{new Date(reply.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => handleVote(reply._id, 'upvote')} className="btn btn-ghost btn-xs text-[10px] text-base-content/50 hover:text-success">▲ {reply.upvotes?.length || 0}</button>
                                    <button onClick={() => handleVote(reply._id, 'downvote')} className="btn btn-ghost btn-xs text-[10px] text-base-content/50 hover:text-error">▼ {reply.downvotes?.length || 0}</button>
                                    {(reply.userId?._id === user?._id || user?.role === 'admin') && (
                                      <button onClick={() => handleDeleteComment(reply._id)} className="btn btn-ghost btn-xs text-[10px] text-error/50 hover:text-error">✕</button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-xs text-base-content/70 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply input */}
                        {replyTo === comment._id && (
                          <div className="ml-6 flex gap-2 items-start">
                            <textarea
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder="Write a reply..."
                              className="textarea textarea-bordered textarea-sm flex-1 bg-base-300/50 text-xs min-h-[60px]"
                            />
                            <div className="flex flex-col gap-1">
                              <button onClick={() => handlePostReply(comment._id)} disabled={!replyContent.trim()} className="btn btn-primary btn-xs">Reply</button>
                              <button onClick={() => { setReplyTo(null); setReplyContent(''); }} className="btn btn-ghost btn-xs">Cancel</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Video Solution ── */}
            {leftTab === "video" && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="font-semibold text-sm text-base-content/70 uppercase tracking-wider flex items-center gap-2">
                  🎥 Video Editorial
                </h2>

                {loadingVideo ? (
                  <div className="flex justify-center py-8"><span className="loading loading-dots loading-md text-primary" /></div>
                ) : !videoData ? (
                  <div className="text-center py-12 text-base-content/40">
                    <p className="text-3xl">🎥</p>
                    <p className="text-sm mt-2">No video solution available yet.</p>
                    <p className="text-xs mt-1">Check back later or explore the text solutions tab.</p>
                  </div>
                ) : (
                  <div className="rounded-xl overflow-hidden bg-black">
                    <video
                      src={videoData.secureUrl}
                      controls
                      className="w-full rounded-xl"
                      style={{ maxHeight: '500px' }}
                    >
                      Your browser does not support the video tag.
                    </video>
                    <div className="p-3 bg-base-300/40">
                      <p className="text-xs text-base-content/50">Duration: {Math.round((videoData.duration || 0) / 60)} min</p>
                    </div>
                  </div>
                )}
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
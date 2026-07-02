import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { useForm, useFieldArray } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import Navbar from "./Navbar";

const LANGUAGES = ["javascript", "c++", "java"];
const DEFAULT_FORM = {
  title: "",
  description: "",
  difficulty: "easy",
  tags: "array",
  visibleTestCases: [{ input: "", output: "", explaination: "" }],
  hiddenTestCases: [{ input: "", output: "" }],
  startCode: [
    { language: "javascript", initialCode: "// JavaScript\nfunction solution() {\n\n}" },
    { language: "c++", initialCode: "// C++\n#include<bits/stdc++.h>\nusing namespace std;\n\nint main() {\n\n}" },
    { language: "java", initialCode: "// Java\npublic class Solution {\n    public static void main(String[] args) {\n\n    }\n}" },
  ],
  referenceSolution: [
    { language: "javascript", completeCode: "" },
    { language: "c++", completeCode: "" },
    { language: "java", completeCode: "" },
  ],
};

function AdminUpdate() {
  const [problems, setProblems]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [editing, setEditing]       = useState(null); // problem being edited
  const [fetchingEdit, setFetchingEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]           = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: DEFAULT_FORM });

  const { fields: vtcFields, append: appendVtc, remove: removeVtc } =
    useFieldArray({ control, name: "visibleTestCases" });
  const { fields: htcFields, append: appendHtc, remove: removeHtc } =
    useFieldArray({ control, name: "hiddenTestCases" });

  useEffect(() => {
    axiosClient
      .get("/problem/getAllProblem")
      .then(({ data }) => setProblems(Array.isArray(data) ? data : []))
      .catch(() => showToast("Failed to load problems", "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = async (id) => {
    setFetchingEdit(true);
    try {
      const { data } = await axiosClient.get(`/problem/getProblemById/${id}`);
      setEditing({ id, title: data.title });
      reset({
        title: data.title || "",
        description: data.description || "",
        difficulty: data.difficulty || "easy",
        tags: data.tags || "array",
        visibleTestCases: data.visibleTestCases?.length
          ? data.visibleTestCases
          : [{ input: "", output: "", explaination: "" }],
        hiddenTestCases: data.hiddenTestCases?.length
          ? data.hiddenTestCases
          : [{ input: "", output: "" }],
        startCode: LANGUAGES.map((lang) => ({
          language: lang,
          initialCode: data.startCode?.find((s) => s.language === lang)?.initialCode || "",
        })),
        referenceSolution: LANGUAGES.map((lang) => ({
          language: lang,
          completeCode: data.referenceSolution?.find((s) => s.language === lang)?.completeCode || "",
        })),
      });
      // Scroll to form
      setTimeout(() => document.getElementById("edit-form")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      showToast("Failed to load problem details", "error");
    } finally {
      setFetchingEdit(false);
    }
  };

  const onSubmit = async (data) => {
    if (!editing) return;
    setSubmitting(true);
    try {
      await axiosClient.put(`/problem/update/${editing.id}`, data);
      setProblems((prev) =>
        prev.map((p) => (p._id === editing.id ? { ...p, title: data.title, difficulty: data.difficulty, tags: data.tags } : p))
      );
      showToast("Problem updated successfully");
      setEditing(null);
      reset(DEFAULT_FORM);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update problem", "error");
    } finally {
      setSubmitting(false);
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Header */}
        <div className="animate-fade-in">
          <NavLink to="/admin" className="text-xs text-base-content/40 hover:text-primary transition-colors flex items-center gap-1 mb-3">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Admin Dashboard
          </NavLink>
          <h1 className="text-3xl font-bold gradient-text">Update Problems</h1>
          <p className="mt-1 text-sm text-base-content/50">Select a problem to edit its details.</p>
        </div>

        {/* Problem List */}
        <div className="glass-card rounded-2xl overflow-hidden shadow-xl animate-fade-in">
          {loading ? (
            <div className="flex justify-center py-16"><span className="loading loading-dots loading-md text-primary" /></div>
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
                  <tr key={p._id} className={`hover:bg-base-content/5 transition-colors duration-200 border-base-content/5 ${editing?.id === p._id ? "bg-primary/5" : ""}`}>
                    <td className="text-base-content/30 font-mono text-sm py-4">{i + 1}</td>
                    <td className="py-4 font-medium">{p.title}</td>
                    <td className="py-4"><span className={`badge badge-sm ${diffCls(p.difficulty)} badge-outline`}>{p.difficulty}</span></td>
                    <td className="py-4 hidden sm:table-cell"><span className="badge badge-sm badge-ghost text-base-content/60">{p.tags}</span></td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleEdit(p._id)}
                        disabled={fetchingEdit}
                        className="btn btn-secondary btn-xs btn-outline hover:bg-secondary transition-all duration-300"
                      >
                        {fetchingEdit && editing?.id === p._id ? <span className="loading loading-spinner loading-xs" /> : "Edit"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Edit Form */}
        {editing && (
          <div id="edit-form" className="glass-card rounded-2xl p-8 shadow-xl animate-slide-up space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold gradient-text">Editing: {editing.title}</h2>
                <p className="text-sm text-base-content/50 mt-0.5">Make changes and submit to update</p>
              </div>
              <button onClick={() => { setEditing(null); reset(DEFAULT_FORM); }} className="btn btn-ghost btn-sm">Cancel</button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Info */}
              <section className="space-y-4">
                <h3 className="font-semibold text-base-content/80 text-sm uppercase tracking-wider">Basic Info</h3>
                <div className="form-control">
                  <label className="label pb-1"><span className="label-text font-medium">Title</span></label>
                  <input {...register("title", { required: true })} className="input input-bordered bg-base-300/50" />
                </div>
                <div className="form-control">
                  <label className="label pb-1"><span className="label-text font-medium">Description</span></label>
                  <textarea {...register("description", { required: true })} rows={5} className="textarea textarea-bordered bg-base-300/50 resize-y" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label pb-1"><span className="label-text font-medium">Difficulty</span></label>
                    <select {...register("difficulty")} className="select select-bordered bg-base-300/50">
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div className="form-control">
                    <label className="label pb-1"><span className="label-text font-medium">Topic</span></label>
                    <select {...register("tags")} className="select select-bordered bg-base-300/50">
                      <option value="array">Array</option>
                      <option value="linkedList">Linked List</option>
                      <option value="graph">Graph</option>
                      <option value="dp">DP</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Visible Test Cases */}
              <section className="space-y-4">
                <h3 className="font-semibold text-base-content/80 text-sm uppercase tracking-wider">Visible Test Cases</h3>
                {vtcFields.map((f, i) => (
                  <div key={f.id} className="bg-base-300/30 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-base-content/50">Case {i + 1}</span>
                      {vtcFields.length > 1 && (
                        <button type="button" onClick={() => removeVtc(i)} className="btn btn-ghost btn-xs text-error">Remove</button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="form-control">
                        <label className="label py-0.5"><span className="label-text text-xs">Input</span></label>
                        <textarea {...register(`visibleTestCases.${i}.input`)} rows={2} className="textarea textarea-bordered bg-base-300/50 font-mono text-sm resize-none" />
                      </div>
                      <div className="form-control">
                        <label className="label py-0.5"><span className="label-text text-xs">Output</span></label>
                        <textarea {...register(`visibleTestCases.${i}.output`)} rows={2} className="textarea textarea-bordered bg-base-300/50 font-mono text-sm resize-none" />
                      </div>
                      <div className="form-control">
                        <label className="label py-0.5"><span className="label-text text-xs">Explanation</span></label>
                        <textarea {...register(`visibleTestCases.${i}.explaination`)} rows={2} className="textarea textarea-bordered bg-base-300/50 text-sm resize-none" />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => appendVtc({ input: "", output: "", explaination: "" })} className="btn btn-ghost btn-sm text-primary">
                  + Add Case
                </button>
              </section>

              {/* Hidden Test Cases */}
              <section className="space-y-4">
                <h3 className="font-semibold text-base-content/80 text-sm uppercase tracking-wider">Hidden Test Cases</h3>
                {htcFields.map((f, i) => (
                  <div key={f.id} className="bg-base-300/30 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-base-content/50">Case {i + 1}</span>
                      {htcFields.length > 1 && (
                        <button type="button" onClick={() => removeHtc(i)} className="btn btn-ghost btn-xs text-error">Remove</button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="form-control">
                        <label className="label py-0.5"><span className="label-text text-xs">Input</span></label>
                        <textarea {...register(`hiddenTestCases.${i}.input`)} rows={2} className="textarea textarea-bordered bg-base-300/50 font-mono text-sm resize-none" />
                      </div>
                      <div className="form-control">
                        <label className="label py-0.5"><span className="label-text text-xs">Output</span></label>
                        <textarea {...register(`hiddenTestCases.${i}.output`)} rows={2} className="textarea textarea-bordered bg-base-300/50 font-mono text-sm resize-none" />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => appendHtc({ input: "", output: "" })} className="btn btn-ghost btn-sm text-primary">
                  + Add Case
                </button>
              </section>

              {/* Starter Code */}
              <section className="space-y-4">
                <h3 className="font-semibold text-base-content/80 text-sm uppercase tracking-wider">Starter Code</h3>
                {LANGUAGES.map((lang, i) => (
                  <div key={lang}>
                    <label className="label py-1"><span className="label-text font-medium capitalize">{lang}</span></label>
                    <textarea {...register(`startCode.${i}.initialCode`)} rows={6} className="textarea textarea-bordered bg-base-300/50 w-full font-mono text-sm resize-y" />
                  </div>
                ))}
              </section>

              {/* Reference Solutions */}
              <section className="space-y-4">
                <h3 className="font-semibold text-base-content/80 text-sm uppercase tracking-wider">Reference Solutions</h3>
                {LANGUAGES.map((lang, i) => (
                  <div key={lang}>
                    <label className="label py-1"><span className="label-text font-medium capitalize">{lang}</span></label>
                    <textarea {...register(`referenceSolution.${i}.completeCode`)} rows={8} className="textarea textarea-bordered bg-base-300/50 w-full font-mono text-sm resize-y" />
                  </div>
                ))}
              </section>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={submitting} className="btn btn-primary font-semibold shadow-lg shadow-primary/20">
                  {submitting ? <span className="loading loading-spinner loading-sm" /> : "Save Changes"}
                </button>
                <button type="button" onClick={() => { setEditing(null); reset(DEFAULT_FORM); }} className="btn btn-ghost">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUpdate;
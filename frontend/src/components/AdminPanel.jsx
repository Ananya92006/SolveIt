import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { NavLink } from "react-router";
import axiosClient from "../utils/axiosClient";
import Navbar from "./Navbar";

const LANGUAGES = ["javascript", "c++", "java"];

const DEFAULT_VALUES = {
  title: "",
  description: "",
  difficulty: "easy",
  tags: "array",
  visibleTestCases: [{ input: "", output: "", explaination: "" }],
  hiddenTestCases:  [{ input: "", output: "" }],
  startCode: [
    { language: "javascript", initialCode: "// JavaScript\nfunction solution() {\n\n}" },
    { language: "c++",        initialCode: "// C++\n#include<bits/stdc++.h>\nusing namespace std;\n\nint main() {\n\n}" },
    { language: "java",       initialCode: "// Java\npublic class Solution {\n    public static void main(String[] args) {\n\n    }\n}" },
  ],
  referenceSolution: [
    { language: "javascript", completeCode: "" },
    { language: "c++",        completeCode: "" },
    { language: "java",       completeCode: "" },
  ],
};

function AdminPanel() {
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]           = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: DEFAULT_VALUES });

  const { fields: vtcFields, append: appendVtc, remove: removeVtc } =
    useFieldArray({ control, name: "visibleTestCases" });
  const { fields: htcFields, append: appendHtc, remove: removeHtc } =
    useFieldArray({ control, name: "hiddenTestCases" });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await axiosClient.post("/problem/create", data);
      showToast("Problem created successfully! 🎉");
      reset(DEFAULT_VALUES);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create problem. Check reference solutions.", "error");
    } finally {
      setSubmitting(false);
    }
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <NavLink to="/admin" className="text-xs text-base-content/40 hover:text-primary transition-colors flex items-center gap-1 mb-3">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Admin Dashboard
          </NavLink>
          <h1 className="text-3xl font-bold gradient-text">Create New Problem</h1>
          <p className="mt-1 text-sm text-base-content/50">Fill in all fields. Reference solutions are validated against visible test cases before saving.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-fade-in">

          {/* Basic Info */}
          <div className="glass-card rounded-2xl p-6 shadow-xl space-y-5">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-base-content/60">Basic Info</h2>

            <div className="form-control">
              <label className="label pb-1"><span className="label-text font-medium">Title</span></label>
              <input {...register("title", { required: true })} placeholder="Two Sum" className="input input-bordered bg-base-300/50 focus:bg-base-300 transition-all duration-300" />
              {errors.title && <span className="text-error text-xs mt-1">Title is required</span>}
            </div>

            <div className="form-control">
              <label className="label pb-1"><span className="label-text font-medium">Description</span></label>
              <textarea {...register("description", { required: true })} rows={6} placeholder="Given an array of integers nums and an integer target..." className="textarea textarea-bordered bg-base-300/50 focus:bg-base-300 transition-all duration-300 resize-y" />
              {errors.description && <span className="text-error text-xs mt-1">Description is required</span>}
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
                <label className="label pb-1"><span className="label-text font-medium">Topic Tag</span></label>
                <select {...register("tags")} className="select select-bordered bg-base-300/50">
                  <option value="array">Array</option>
                  <option value="linkedList">Linked List</option>
                  <option value="graph">Graph</option>
                  <option value="dp">DP</option>
                </select>
              </div>
            </div>
          </div>

          {/* Visible Test Cases */}
          <div className="glass-card rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm uppercase tracking-wider text-base-content/60">Visible Test Cases</h2>
              <button type="button" onClick={() => appendVtc({ input: "", output: "", explaination: "" })} className="btn btn-ghost btn-xs text-primary">+ Add</button>
            </div>
            {vtcFields.map((f, i) => (
              <div key={f.id} className="bg-base-300/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-base-content/40">Case {i + 1}</span>
                  {vtcFields.length > 1 && <button type="button" onClick={() => removeVtc(i)} className="btn btn-ghost btn-xs text-error">Remove</button>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="form-control">
                    <label className="label py-0.5"><span className="label-text text-xs">Input</span></label>
                    <textarea {...register(`visibleTestCases.${i}.input`, { required: true })} rows={2} className="textarea textarea-bordered bg-base-300/50 font-mono text-sm resize-none" />
                  </div>
                  <div className="form-control">
                    <label className="label py-0.5"><span className="label-text text-xs">Output</span></label>
                    <textarea {...register(`visibleTestCases.${i}.output`, { required: true })} rows={2} className="textarea textarea-bordered bg-base-300/50 font-mono text-sm resize-none" />
                  </div>
                  <div className="form-control">
                    <label className="label py-0.5"><span className="label-text text-xs">Explanation</span></label>
                    <textarea {...register(`visibleTestCases.${i}.explaination`, { required: true })} rows={2} className="textarea textarea-bordered bg-base-300/50 text-sm resize-none" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Hidden Test Cases */}
          <div className="glass-card rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm uppercase tracking-wider text-base-content/60">Hidden Test Cases</h2>
              <button type="button" onClick={() => appendHtc({ input: "", output: "" })} className="btn btn-ghost btn-xs text-primary">+ Add</button>
            </div>
            {htcFields.map((f, i) => (
              <div key={f.id} className="bg-base-300/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-base-content/40">Case {i + 1}</span>
                  {htcFields.length > 1 && <button type="button" onClick={() => removeHtc(i)} className="btn btn-ghost btn-xs text-error">Remove</button>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-control">
                    <label className="label py-0.5"><span className="label-text text-xs">Input</span></label>
                    <textarea {...register(`hiddenTestCases.${i}.input`, { required: true })} rows={2} className="textarea textarea-bordered bg-base-300/50 font-mono text-sm resize-none" />
                  </div>
                  <div className="form-control">
                    <label className="label py-0.5"><span className="label-text text-xs">Output</span></label>
                    <textarea {...register(`hiddenTestCases.${i}.output`, { required: true })} rows={2} className="textarea textarea-bordered bg-base-300/50 font-mono text-sm resize-none" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Starter Code */}
          <div className="glass-card rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-base-content/60">Starter Code</h2>
            {LANGUAGES.map((lang, i) => (
              <div key={lang}>
                <label className="label py-1"><span className="label-text font-medium capitalize">{lang}</span></label>
                <textarea {...register(`startCode.${i}.initialCode`, { required: true })} rows={6} className="textarea textarea-bordered bg-base-300/50 w-full font-mono text-sm resize-y" />
              </div>
            ))}
          </div>

          {/* Reference Solutions */}
          <div className="glass-card rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-base-content/60">Reference Solutions</h2>
            <p className="text-xs text-base-content/40">These are validated against visible test cases before the problem is saved.</p>
            {LANGUAGES.map((lang, i) => (
              <div key={lang}>
                <label className="label py-1"><span className="label-text font-medium capitalize">{lang}</span></label>
                <textarea {...register(`referenceSolution.${i}.completeCode`, { required: true })} rows={8} className="textarea textarea-bordered bg-base-300/50 w-full font-mono text-sm resize-y" />
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pb-8">
            <button type="submit" disabled={submitting} className="btn btn-primary font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
              {submitting ? (
                <><span className="loading loading-spinner loading-sm" /> Validating & Creating...</>
              ) : "Create Problem"}
            </button>
            <button type="button" onClick={() => reset(DEFAULT_VALUES)} className="btn btn-ghost">Reset</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminPanel;

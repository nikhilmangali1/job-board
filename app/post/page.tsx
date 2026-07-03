"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PreviewModal from "../components/PreviewModal";
import PostJobPreview from "../components/PostJobPreview";

const REQUIRED_FIELDS = ["title", "company", "location", "description"] as const;
const FIELD_LABELS: Record<string, string> = {
  title: "Job Title", company: "Company", location: "Location",
  type: "Job Type", description: "Description",
};
const DRAFT_KEY = "techjobs_draft";
const DESC_MAX = 1000;
const ALL_FIELDS = ["title", "company", "location", "type", "salary_range", "description", "requirements", "apply_url"];

function FormField({
  label, icon, error, touched, helperText, children,
}: {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  touched?: boolean;
  helperText?: string;
  children: React.ReactNode;
}) {
  const hasError = error && touched;
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
            {icon}
          </div>
        )}
        {children}
      </div>
      {hasError ? (
        <p className="text-xs text-rose-500 dark:text-rose-400 font-medium" role="alert">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-gray-400 dark:text-gray-500">{helperText}</p>
      ) : null}
    </div>
  );
}

const inputStyle = (hasError: boolean, hasIcon: boolean) =>
  `w-full input ${hasIcon ? "pl-9" : "pl-3"} pr-3 py-2.5 text-sm rounded-xl transition-all duration-200 ${
    hasError ? "!border-rose-300 dark:!border-rose-500/50" : ""
  }`;

export default function PostJobPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", company: "", location: "", type: "Full-time",
    salary_range: "", description: "", requirements: "", apply_url: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) setTimeout(() => setForm(JSON.parse(saved)), 0);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    } catch { /* ignore */ }
  }, [form]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "description" && value.length > DESC_MAX) {
      setForm((prev) => ({ ...prev, [name]: value.slice(0, DESC_MAX) }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const name = e.target.name;
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (REQUIRED_FIELDS.includes(name as typeof REQUIRED_FIELDS[number]) && !form[name as keyof typeof form].toString().trim()) {
      setErrors((prev) => ({ ...prev, [name]: `${FIELD_LABELS[name]} is required` }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    for (const field of REQUIRED_FIELDS) {
      if (!form[field].toString().trim()) {
        newErrors[field] = `${FIELD_LABELS[field]} is required`;
      }
    }
    setErrors(newErrors);
    setTouched(Object.fromEntries(REQUIRED_FIELDS.map((f) => [f, true])));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setPreviewOpen(false);
    if (!validate()) return;
    setSubmitting(true);
    setServerError("");

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          salary_range: form.salary_range || null,
          requirements: form.requirements || null,
          apply_url: form.apply_url || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to post job");
      }

      localStorage.removeItem(DRAFT_KEY);
      router.push("/?toast=Job+posted+successfully");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const completionPercent = useMemo(() => {
    const filled = ALL_FIELDS.filter((f) => form[f as keyof typeof form].toString().trim().length > 0).length;
    return Math.round((filled / ALL_FIELDS.length) * 100);
  }, [form]);

  const tips = useMemo(() => {
    const items: { type: "success" | "warning" | "info"; text: string }[] = [];
    if (form.title.length >= 5) items.push({ type: "success", text: "Great title — clear and descriptive" });
    else if (form.title.length > 0) items.push({ type: "warning", text: "Title seems short for a job listing" });
    if (form.salary_range) items.push({ type: "success", text: "Salary included — attracts more candidates" });
    if (form.description.length > 50) items.push({ type: "success", text: "Description has good detail" });
    else if (form.description.length > 0) items.push({ type: "warning", text: "Description could use more detail" });
    if (form.apply_url) {
      try { new URL(form.apply_url); items.push({ type: "success", text: "Application URL is valid" }); }
      catch { items.push({ type: "warning", text: "Application URL may be invalid" }); }
    }
    if (form.requirements) items.push({ type: "info", text: "Requirements help candidates self-select" });
    if (form.type) items.push({ type: "info", text: `Job type set to ${form.type}` });
    if (!form.salary_range && form.title) items.push({ type: "warning", text: "Adding salary range increases applications" });
    return items;
  }, [form]);

  const Icon = { briefcase: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>, building: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/></svg>, mapPin: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, currency: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, file: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>, link: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>, clock: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, tag: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg> };

  const setType = (type: string) => {
    setForm((prev) => ({ ...prev, type }));
  };

  return (
    <div className="pb-16">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Create New Job</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Publish a professional job listing</p>
        </div>
      </div>

      {serverError && (
        <div className="p-4 mb-6 rounded-xl border border-rose-200/50 dark:border-rose-500/20 bg-rose-50/80 dark:bg-rose-900/10 backdrop-blur-sm animate-fade-in" role="alert">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{serverError}</p>
          </div>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); if (validate()) setPreviewOpen(true); }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column — Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Basic Information */}
            <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700/30">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 dark:text-indigo-400"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                </div>
                <span className="label mb-0">Basic Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Job Title *" icon={Icon.briefcase} error={errors.title} touched={touched.title} helperText="e.g. Senior Frontend Engineer">
                  <input id="title" name="title" value={form.title} onChange={handleChange} onBlur={handleBlur}
                    placeholder="Senior Frontend Engineer"
                    className={inputStyle(!!(errors.title && touched.title), true)}
                    aria-required="true" aria-invalid={!!(errors.title && touched.title)} />
                </FormField>
                <FormField label="Company *" icon={Icon.building} error={errors.company} touched={touched.company} helperText="Your company or brand name">
                  <input id="company" name="company" value={form.company} onChange={handleChange} onBlur={handleBlur}
                    placeholder="Acme Corp"
                    className={inputStyle(!!(errors.company && touched.company), true)}
                    aria-required="true" aria-invalid={!!(errors.company && touched.company)} />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Location *" icon={Icon.mapPin} error={errors.location} touched={touched.location} helperText="City or Remote">
                  <input id="location" name="location" value={form.location} onChange={handleChange} onBlur={handleBlur}
                    placeholder="San Francisco, CA"
                    className={inputStyle(!!(errors.location && touched.location), true)}
                    aria-required="true" aria-invalid={!!(errors.location && touched.location)} />
                </FormField>
                <FormField label="Job Type" icon={Icon.tag}>
                  <div className="flex gap-1.5 flex-wrap pt-0.5">
                    {["Full-time", "Part-time", "Contract", "Remote", "Internship"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                          form.type === t ? "chip-active" : "chip"
                        }`}
                        aria-pressed={form.type === t}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <input type="hidden" name="type" value={form.type} />
                </FormField>
              </div>
            </div>

            {/* Section 2: Compensation */}
            <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700/30">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 dark:text-emerald-400"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <span className="label mb-0">Compensation</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Salary Range" icon={Icon.currency} helperText="e.g. 12 LPA - 18 LPA">
                  <input id="salary_range" name="salary_range" value={form.salary_range} onChange={handleChange}
                    placeholder="12 LPA - 18 LPA"
                    className={inputStyle(false, true)} />
                </FormField>
              </div>
            </div>

            {/* Section 3: Job Details */}
            <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700/30">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 dark:text-amber-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <span className="label mb-0">Job Details</span>
              </div>

              <FormField label="Description *" error={errors.description} touched={touched.description}>
                <textarea id="description" name="description" value={form.description} onChange={handleChange} onBlur={handleBlur}
                  placeholder="Describe the role, responsibilities, and what makes this opportunity great..."
                  rows={4}
                  className={`${inputStyle(!!(errors.description && touched.description), false)} resize-none min-h-[100px]`}
                  aria-required="true" aria-invalid={!!(errors.description && touched.description)} />
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {form.description ? `${Math.max(1, Math.round(form.description.split(/\s+/).filter(Boolean).length))} words` : ""}
                  </span>
                  <span className={`text-xs font-medium ${form.description.length >= DESC_MAX ? "text-rose-500" : "text-gray-400 dark:text-gray-500"}`}>
                    {form.description.length}/{DESC_MAX}
                  </span>
                </div>
              </FormField>

              <FormField label="Requirements" helperText="Key skills, experience, and qualifications">
                <textarea id="requirements" name="requirements" value={form.requirements} onChange={handleChange}
                  placeholder="5+ years of React experience, strong TypeScript skills..."
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm rounded-xl input resize-none min-h-[80px]" />
              </FormField>
            </div>

            {/* Section 4: Application */}
            <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700/30">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-600 dark:text-cyan-400"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                </div>
                <span className="label mb-0">Application</span>
              </div>

              <FormField label="Apply URL" icon={Icon.link} helperText="Link to your careers page or application form">
                <input id="apply_url" name="apply_url" value={form.apply_url} onChange={handleChange}
                  placeholder="https://company.com/careers/apply"
                  className={inputStyle(false, true)} type="url" aria-label="Application URL" />
              </FormField>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button type="button" onClick={() => { if (validate()) setPreviewOpen(true); }}
                className="btn btn-secondary flex-1 btn-md">
                Preview
              </button>
              <button type="submit" disabled={submitting}
                className="btn btn-primary flex-1 btn-md">
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Posting...
                  </span>
                ) : "Post Job"}
              </button>
            </div>
          </div>

          {/* Right Column — Preview & Tips */}
          <div className="space-y-5">
            {/* Progress */}
            <div className="surface-card rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="label mb-0">Completion</span>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 tabular-nums">{completionPercent}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 ease-out"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                {completionPercent < 100 ? `${ALL_FIELDS.length - ALL_FIELDS.filter((f) => form[f as keyof typeof form].toString().trim().length > 0).length} fields remaining` : "All fields complete"}
              </p>
            </div>

            {/* Live Preview */}
            <div className="surface-card rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 dark:text-indigo-400"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
                <span className="label mb-0">Live Preview</span>
              </div>
              <PostJobPreview data={form} />
            </div>

            {/* Tips */}
            {tips.length > 0 && (
              <div className="surface-card rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-amber-900/30 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 dark:text-amber-400"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  </div>
                  <span className="label mb-0">Suggestions</span>
                </div>
                <div className="space-y-2">
                  {tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                      {tip.type === "success" ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 shrink-0 mt-0.5"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : tip.type === "warning" ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400 shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{tip.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </form>

      <PreviewModal
        data={form}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PreviewModal from "../components/PreviewModal";

const REQUIRED_FIELDS = ["title", "company", "location", "description"] as const;
const FIELD_LABELS: Record<string, string> = {
  title: "Job Title", company: "Company", location: "Location",
  type: "Job Type", description: "Description",
};
const DRAFT_KEY = "techjobs_draft";
const DESC_MAX = 500;

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
    if (name === "description" && value.length > DESC_MAX) return;
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

  const inputClass = (name: string) =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-white dark:bg-gray-700 dark:text-gray-100 ${
      errors[name] && touched[name]
        ? "border-red-400 dark:border-red-500 focus:ring-red-400"
        : "dark:border-gray-600 focus:ring-blue-500"
    }`;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Post a Job</h1>

      {serverError && <p className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mb-4" role="alert">{serverError}</p>}

      <form onSubmit={(e) => { e.preventDefault(); if (validate()) setPreviewOpen(true); }} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 space-y-4 transition-colors">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="title">Job Title *</label>
          <input id="title" name="title" value={form.title} onChange={handleChange} onBlur={handleBlur}
            className={inputClass("title")} aria-required="true" aria-invalid={!!(errors.title && touched.title)} aria-describedby={errors.title && touched.title ? "title-error" : undefined} />
          {errors.title && touched.title && <p id="title-error" className="text-sm text-red-500 dark:text-red-400 mt-1" role="alert">{errors.title}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="company">Company *</label>
            <input id="company" name="company" value={form.company} onChange={handleChange} onBlur={handleBlur}
              className={inputClass("company")} aria-required="true" aria-invalid={!!(errors.company && touched.company)} aria-describedby={errors.company && touched.company ? "company-error" : undefined} />
            {errors.company && touched.company && <p id="company-error" className="text-sm text-red-500 dark:text-red-400 mt-1" role="alert">{errors.company}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="location">Location *</label>
            <input id="location" name="location" value={form.location} onChange={handleChange} onBlur={handleBlur}
              className={inputClass("location")} aria-required="true" aria-invalid={!!(errors.location && touched.location)} aria-describedby={errors.location && touched.location ? "location-error" : undefined} />
            {errors.location && touched.location && <p id="location-error" className="text-sm text-red-500 dark:text-red-400 mt-1" role="alert">{errors.location}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="type">Job Type *</label>
            <select id="type" name="type" value={form.type} onChange={handleChange}
              className={inputClass("type")} aria-label="Job type">
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Remote</option>
              <option>Internship</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="salary_range">Salary Range</label>
            <input id="salary_range" name="salary_range" value={form.salary_range} onChange={handleChange} placeholder="e.g. 12 LPA - 18 LPA"
              className={inputClass("salary_range")} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="description">Description *</label>
          <textarea id="description" name="description" value={form.description} onChange={handleChange} onBlur={handleBlur} rows={4}
            className={inputClass("description")} aria-required="true" aria-invalid={!!(errors.description && touched.description)} aria-describedby={errors.description && touched.description ? "desc-error" : undefined} />
          <div className="flex justify-between mt-1">
            {errors.description && touched.description ? <p id="desc-error" className="text-sm text-red-500 dark:text-red-400" role="alert">{errors.description}</p> : <span />}
            <span className={`text-xs ${form.description.length >= DESC_MAX ? "text-red-500" : "text-gray-400 dark:text-gray-500"}`}>{form.description.length}/{DESC_MAX}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="requirements">Requirements</label>
          <textarea id="requirements" name="requirements" value={form.requirements} onChange={handleChange} rows={3}
            className={inputClass("requirements")} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="apply_url">Apply URL</label>
          <input id="apply_url" name="apply_url" value={form.apply_url} onChange={handleChange} placeholder="https://company.com/careers/apply"
            className={inputClass("apply_url")} type="url" aria-label="Application URL" />
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => { if (validate()) setPreviewOpen(true); }}
            className="flex-1 px-4 py-2.5 rounded-lg border dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors">
            Preview
          </button>
          <button type="submit" disabled={submitting}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors">
            {submitting ? "Posting..." : "Post Job"}
          </button>
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

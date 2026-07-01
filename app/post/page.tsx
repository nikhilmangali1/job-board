"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const REQUIRED_FIELDS = ["title", "company", "location", "description"] as const;
const FIELD_LABELS: Record<string, string> = {
  title: "Job Title", company: "Company", location: "Location",
  type: "Job Type", description: "Description",
};

export default function PostJobPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", company: "", location: "", type: "Full-time",
    salary_range: "", description: "", requirements: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const name = e.target.name;
    setTouched({ ...touched, [name]: true });
    if (REQUIRED_FIELDS.includes(name as typeof REQUIRED_FIELDS[number]) && !form[name as keyof typeof form].toString().trim()) {
      setErrors({ ...errors, [name]: `${FIELD_LABELS[name]} is required` });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to post job");
      }

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

      {serverError && <p className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mb-4">{serverError}</p>}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 space-y-4 transition-colors">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title *</label>
          <input name="title" value={form.title} onChange={handleChange} onBlur={handleBlur}
            className={inputClass("title")} />
          {errors.title && touched.title && <p className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.title}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company *</label>
            <input name="company" value={form.company} onChange={handleChange} onBlur={handleBlur}
              className={inputClass("company")} />
            {errors.company && touched.company && <p className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.company}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location *</label>
            <input name="location" value={form.location} onChange={handleChange} onBlur={handleBlur}
              className={inputClass("location")} />
            {errors.location && touched.location && <p className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.location}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Type *</label>
            <select name="type" value={form.type} onChange={handleChange}
              className={inputClass("type")}>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Remote</option>
              <option>Internship</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Salary Range</label>
            <input name="salary_range" value={form.salary_range} onChange={handleChange} placeholder="e.g. 12 LPA - 18 LPA"
              className={inputClass("salary_range")} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
          <textarea name="description" value={form.description} onChange={handleChange} onBlur={handleBlur} rows={4}
            className={inputClass("description")} />
          {errors.description && touched.description && <p className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.description}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requirements</label>
          <textarea name="requirements" value={form.requirements} onChange={handleChange} rows={3}
            className={inputClass("requirements")} />
        </div>

        <button type="submit" disabled={submitting}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium dark:bg-blue-500 dark:hover:bg-blue-600">
          {submitting ? "Posting..." : "Post Job"}
        </button>
      </form>
    </div>
  );
}

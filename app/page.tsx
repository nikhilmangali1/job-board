"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { relativeDate, getInitials, JOB_TYPE_STYLES } from "@/lib/utils";
import SkeletonCard from "./components/SkeletonCard";
import Toast from "./components/Toast";

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary_range: string | null;
  description: string;
  created_at: string;
};

const JOB_TYPES = ["", "Full-time", "Part-time", "Contract", "Remote", "Internship"];

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (typeFilter) params.set("type", typeFilter);
    if (sort !== "newest") params.set("sort", sort);

    const loadingTimer = setTimeout(() => setLoading(true), 0);
    fetch(`/api/jobs?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setJobs(data))
      .finally(() => {
        clearTimeout(loadingTimer);
        setLoading(false);
      });
  }, [search, typeFilter, sort]);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const msg = params.get("toast");
    if (msg) {
      const decoded = decodeURIComponent(msg);
      window.history.replaceState({}, "", "/");
      const showTimer = setTimeout(() => setToastMsg(decoded), 50);
      const hideTimer = setTimeout(() => setToastMsg(null), 3050);
      return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
    }
  }, []);

  return (
    <div>
      <Toast message={toastMsg} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Tech Jobs</h1>
        <p className="text-gray-600 dark:text-gray-400">Find your next opportunity in tech</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by title, company, or location..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full px-4 py-2.5 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(""); setSearch(""); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="salary">Salary (high-low)</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {JOB_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              typeFilter === type
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {type || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        </>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-300 dark:text-gray-600 mb-4">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-1">No jobs found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Try a different search or filter</p>
          <Link href="/post" className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-sm font-medium">Post a Job</Link>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Showing {jobs.length} job{jobs.length !== 1 ? "s" : ""}</p>
          <div className="grid gap-4">
            {jobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="block bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/50 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-sm font-semibold shrink-0 mt-0.5">
                      {getInitials(job.company)}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{job.title}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{job.company} &middot; {job.location}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${JOB_TYPE_STYLES[job.type] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}>{job.type}</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mt-3 line-clamp-2 text-sm">{job.description}</p>
                <div className="flex items-center justify-between mt-3">
                  {job.salary_range && <p className="text-sm text-green-600 dark:text-green-400 font-medium">{job.salary_range}</p>}
                  <p className="text-xs text-gray-400 dark:text-gray-500">{relativeDate(job.created_at)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

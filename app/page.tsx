"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { relativeDate, getInitials, JOB_TYPE_STYLES } from "@/lib/utils";
import { computeMatch } from "@/lib/jobMatcher";
import { clearResume, loadResume } from "@/lib/resumeParser";
import SkeletonCard from "./components/SkeletonCard";
import Toast from "./components/Toast";
import ResumeAnalyzer from "./components/ResumeAnalyzer";
import MatchBadge from "./components/MatchBadge";
import MatchDetails from "./components/MatchDetails";

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary_range: string | null;
  description: string;
  requirements: string | null;
  created_at: string;
};

const JOB_TYPES = ["", "Full-time", "Part-time", "Contract", "Remote", "Internship"];

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [resumeSkills, setResumeSkills] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const [autoExpandResume, setAutoExpandResume] = useState(false);
  const [matchFilter, setMatchFilter] = useState(false);

  useEffect(() => {
    const { text, skills } = loadResume();
    setTimeout(() => { setResumeText(text); setResumeSkills(skills); }, 0);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("search") || "";
    const t = params.get("type") || "";
    const l = params.get("location") || "";
    const m = params.get("minSalary") || "";
    const r = params.get("remote") === "true";
    const so = params.get("sort") || "newest";
    const msg = params.get("toast");
    const mf = params.get("matchFilter") === "true";
    const focusSearch = params.get("focusSearch") === "true";
    const analyzeResume = params.get("analyzeResume") === "true";

    setTimeout(() => {
      setSearchInput(s);
      setSearch(s);
      setTypeFilter(t);
      setLocationFilter(l);
      setMinSalary(m);
      setRemoteOnly(r);
      setSort(so);
      setMatchFilter(mf);
    }, 0);

    if (focusSearch) {
      const cleanUrl = window.location.pathname + window.location.search.replace(/[?&]focusSearch=true/g, "").replace(/^\?$/, "");
      window.history.replaceState({}, "", cleanUrl);
      setTimeout(() => searchRef.current?.focus(), 100);
    }

    if (analyzeResume) {
      const cleanUrl = window.location.pathname + window.location.search.replace(/[?&]analyzeResume=true/g, "").replace(/^\?$/, "");
      window.history.replaceState({}, "", cleanUrl);
      setTimeout(() => setAutoExpandResume(true), 0);
      setTimeout(() => {
        document.getElementById("resume-analyzer")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }

    if (msg) {
      const decoded = decodeURIComponent(msg);
      window.history.replaceState({}, "", "/");
      setTimeout(() => setToastMsg(decoded), 50);
      setTimeout(() => setToastMsg(null), 3050);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (typeFilter) params.set("type", typeFilter);
    if (locationFilter) params.set("location", locationFilter);
    if (minSalary) params.set("minSalary", minSalary);
    if (remoteOnly) params.set("remote", "true");
    if (sort !== "newest") params.set("sort", sort);
    if (matchFilter) params.set("matchFilter", "true");

    const qs = params.toString();
    window.history.replaceState({}, "", qs ? `/?${qs}` : "/");

    const apiParams = new URLSearchParams();
    if (search) apiParams.set("search", search);
    if (typeFilter) apiParams.set("type", typeFilter);
    if (locationFilter) apiParams.set("location", locationFilter);
    if (minSalary) apiParams.set("minSalary", minSalary);
    if (remoteOnly) apiParams.set("remote", "true");
    if (sort !== "newest" && sort !== "bestmatch") apiParams.set("sort", sort);

    const loadingTimer = setTimeout(() => setLoading(true), 0);
    fetch(`/api/jobs?${apiParams.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        let result = data;
        if (resumeSkills.length > 0) {
          if (sort === "bestmatch") {
            result = [...data].sort((a: Job, b: Job) => {
              const mA = computeMatch(a, resumeSkills);
              const mB = computeMatch(b, resumeSkills);
              return mB.score - mA.score;
            });
          }
        }
        setJobs(result);
      })
      .finally(() => {
        clearTimeout(loadingTimer);
        setLoading(false);
      });
  }, [search, typeFilter, locationFilter, minSalary, remoteOnly, sort, resumeSkills, matchFilter]);

  useEffect(() => {
    const handler = () => {
      clearResume();
      setResumeText("");
      setResumeSkills([]);
      setMatchFilter(false);
      setToastMsg("Resume cleared");
      setTimeout(() => setToastMsg(null), 3050);
    };
    window.addEventListener("app:clearResume", handler);
    return () => window.removeEventListener("app:clearResume", handler);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const matchResults = useMemo(() => {
    if (resumeSkills.length === 0) return new Map<number, ReturnType<typeof computeMatch>>();
    const map = new Map<number, ReturnType<typeof computeMatch>>();
    for (const job of jobs) {
      map.set(job.id, computeMatch(job, resumeSkills));
    }
    return map;
  }, [jobs, resumeSkills]);

  const displayJobs = useMemo(() => {
    if (matchFilter && resumeSkills.length > 0) {
      return jobs.filter((j) => (matchResults.get(j.id)?.score ?? 0) >= 80);
    }
    return jobs;
  }, [jobs, matchFilter, matchResults, resumeSkills]);

  return (
    <div>
      <Toast message={toastMsg} />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Tech Jobs</h1>
        <p className="text-gray-600 dark:text-gray-400">Find your next opportunity in tech</p>
      </div>

      <div id="resume-analyzer">
        <ResumeAnalyzer
          resumeText={resumeText}
          resumeSkills={resumeSkills}
          onAnalyze={(text, skills) => { setResumeText(text); setResumeSkills(skills); }}
          onClear={() => { setResumeText(""); setResumeSkills([]); }}
          autoExpand={autoExpandResume}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by title, company, or location..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            ref={searchRef}
            className="w-full px-4 py-2.5 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
            aria-label="Search jobs"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(""); setSearch(""); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            aria-label="Sort jobs"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="salary">Salary (high-low)</option>
            {resumeSkills.length > 0 && <option value="bestmatch">Best Match</option>}
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
              showFilters || locationFilter || minSalary || remoteOnly
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            aria-label={showFilters ? "Hide filters" : "Show filters"}
            aria-expanded={showFilters}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><circle cx="4" cy="11" r="2"/><circle cx="12" cy="10" r="2"/><circle cx="20" cy="14" r="2"/></svg>
            Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-3 mb-4 p-4 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 transition-colors" role="region" aria-label="Search filters">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1" htmlFor="filter-location">Location</label>
            <input
              id="filter-location"
              type="text"
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 text-sm"
              aria-label="Filter by location"
            />
          </div>
          <div className="w-32">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1" htmlFor="filter-salary">Min Salary</label>
            <input
              id="filter-salary"
              type="number"
              placeholder="e.g. 50000"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 text-sm"
              aria-label="Minimum salary"
            />
          </div>
          <div className="flex items-end pb-2">
            <button
              onClick={() => setRemoteOnly(!remoteOnly)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                remoteOnly
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
              }`}
              aria-pressed={remoteOnly}
              aria-label="Remote only"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              Remote
            </button>
          </div>
        </div>
      )}

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
            aria-label={type ? `Filter by ${type}` : "Show all types"}
            aria-pressed={typeFilter === type}
          >
            {type || "All"}
          </button>
        ))}
        {resumeSkills.length > 0 && (
          <button
            onClick={() => setMatchFilter(!matchFilter)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              matchFilter
                ? "bg-green-600 text-white shadow-sm"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            aria-pressed={matchFilter}
            aria-label="Filter by 80% or higher match"
          >
            80%+ matches
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : displayJobs.length === 0 ? (
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
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Showing {displayJobs.length} job{displayJobs.length !== 1 ? "s" : ""}
            {displayJobs.length !== jobs.length && ` (filtered from ${jobs.length})`}
          </p>
          <div className="grid gap-4">
            {displayJobs.map((job) => {
              const match = matchResults.get(job.id) ?? null;
              return (
                <Link key={job.id} href={`/jobs/${job.id}`} className="block bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/50 hover:scale-[1.02] transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-sm font-semibold shrink-0 mt-0.5">
                        {getInitials(job.company)}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{job.title}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">{job.company} &middot; {job.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {resumeSkills.length > 0 && <MatchBadge score={match?.score ?? null} />}
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${JOB_TYPE_STYLES[job.type] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}>{job.type}</span>
                    </div>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mt-3 line-clamp-2 text-sm">{job.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {job.salary_range && <p className="text-sm text-green-600 dark:text-green-400 font-medium truncate">{job.salary_range}</p>}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{relativeDate(job.created_at)}</p>
                  </div>
                  {resumeSkills.length > 0 && match && (
                    <MatchDetails match={match} />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

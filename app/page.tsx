"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { computeMatch } from "@/lib/jobMatcher";
import { clearResume, loadResume } from "@/lib/resumeParser";
import SkeletonCard from "./components/SkeletonCard";
import Toast from "./components/Toast";
import ResumeAnalyzer from "./components/ResumeAnalyzer";
import RecentlyViewed from "./components/RecentlyViewed";
import InsightsPreview from "./components/InsightsPreview";
import JobCard from "./components/JobCard";
import type { Stats } from "@/lib/analytics";
import AnimatedNumber from "./components/InsightsDashboard/AnimatedNumber";

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
  const [companyFilter, setCompanyFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [resumeSkills, setResumeSkills] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const [matchFilter, setMatchFilter] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [savedJobs, setSavedJobs] = useState<Set<number>>(new Set());

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
    const c = params.get("company") || "";
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
      setCompanyFilter(c);
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
    if (companyFilter) params.set("company", companyFilter);
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
    if (companyFilter) apiParams.set("company", companyFilter);
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
  }, [search, typeFilter, locationFilter, minSalary, remoteOnly, companyFilter, sort, resumeSkills, matchFilter]);

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

  useEffect(() => {
    fetch("/api/analytics/summary")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

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

  const toggleSave = (id: number) => {
    setSavedJobs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const POPULAR_SEARCHES = ["React", "Python", "Remote", "Bangalore", "Full-time", "Node.js"];

  return (
    <div className="pb-8">
      <Toast message={toastMsg} />

      {/* Desktop: two-column grid (hidden on smaller screens) */}
      <div className="hidden xl:grid xl:grid-cols-[minmax(0,3fr)_minmax(320px,1fr)] xl:gap-6">
        {/* Left column — main content */}
        <div className="min-w-0">
          {/* Statistics Section */}
          {stats && stats.totalJobs > 0 && (
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4" aria-label="Platform statistics">
              {[
                { label: "Total Jobs", value: stats.totalJobs, icon: "briefcase", color: "from-indigo-500 to-violet-500", border: "border-indigo-200/30 dark:border-indigo-500/20" },
                { label: "Companies", value: stats.totalCompanies, icon: "building", color: "from-violet-500 to-purple-500", border: "border-violet-200/30 dark:border-violet-500/20" },
                { label: "Avg Salary", value: stats.avgSalary ? `\u20B9${stats.avgSalary.toFixed(1)}L` : "\u2014", icon: "currency", color: "from-emerald-500 to-teal-500", border: "border-emerald-200/30 dark:border-emerald-500/20", isFormatted: true },
                { label: "New This Week", value: stats.jobsThisWeek, icon: "trending", color: "from-amber-500 to-orange-500", border: "border-amber-200/30 dark:border-amber-500/20" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`relative overflow-hidden surface-card rounded-xl ${stat.border} p-3.5`}
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-[0.04] dark:opacity-[0.08] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none`} />
                  <div className="relative flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm`}>
                      {stat.icon === "briefcase" ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                      ) : stat.icon === "building" ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/></svg>
                      ) : stat.icon === "currency" ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate font-medium">{stat.label}</p>
                      {stat.isFormatted ? (
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-px">{stat.value}</p>
                      ) : (
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums mt-px">
                          <AnimatedNumber value={typeof stat.value === "number" ? stat.value : 0} />
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Analytics + Recently Viewed */}
          {stats && stats.totalJobs > 0 && (
            <div className="mb-4">
              <div className="surface-card rounded-xl overflow-hidden">
                <InsightsPreview stats={stats} />
              </div>
              <RecentlyViewed />
            </div>
          )}

          {/* Sticky Job Toolbar */}
          <div className="sticky top-[57px] z-10 surface-glass backdrop-blur-xl -mx-4 sm:-mx-6 xl:-mx-0 px-4 sm:px-6 xl:px-0 py-2.5 mb-3 border-b border-white/30 dark:border-white/[0.04] transition-colors">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  ref={searchRef}
                  className="input w-full pl-9 pr-8 py-2 rounded-lg text-sm"
                  aria-label="Search jobs"
                />
                {searchInput && (
                  <button
                    onClick={() => { setSearchInput(""); setSearch(""); }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    aria-label="Clear search"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="select px-3 py-2 rounded-lg text-sm"
                  aria-label="Sort jobs"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="salary">Salary (high-low)</option>
                  {resumeSkills.length > 0 && <option value="bestmatch">Best Match</option>}
                </select>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    showFilters || locationFilter || minSalary || remoteOnly || companyFilter
                      ? "btn-primary"
                      : "btn-secondary"
                  }`}
                  aria-label={showFilters ? "Hide filters" : "Show filters"}
                  aria-expanded={showFilters}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1 -mt-0.5"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><circle cx="4" cy="11" r="2"/><circle cx="12" cy="10" r="2"/><circle cx="20" cy="14" r="2"/></svg>
                  Filters
                </button>
              </div>
            </div>

            {/* Filter panel */}
            {showFilters && (
              <div className="flex flex-wrap gap-3 mt-2.5 p-3.5 surface-card rounded-xl transition-colors" role="region" aria-label="Search filters">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5" htmlFor="filter-location">Location</label>
                  <input
                    id="filter-location"
                    type="text"
                    placeholder="Filter by location..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="input w-full px-3 py-2 rounded-lg text-sm"
                    aria-label="Filter by location"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5" htmlFor="filter-salary">Min Salary</label>
                  <input
                    id="filter-salary"
                    type="number"
                    placeholder="e.g. 5"
                    value={minSalary}
                    onChange={(e) => setMinSalary(e.target.value)}
                    className="input w-full px-3 py-2 rounded-lg text-sm"
                    aria-label="Minimum salary in LPA"
                  />
                </div>
                <div className="flex items-end pb-0.5">
                  <button
                    onClick={() => setRemoteOnly(!remoteOnly)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      remoteOnly
                        ? "chip-active"
                        : "chip"
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

            {/* Popular search tags */}
            <div className="flex flex-wrap gap-2 mt-2.5 justify-center sm:justify-start">
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium mr-1 self-center">Popular:</span>
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => { setSearchInput(term); setSearch(term); searchRef.current?.focus(); }}
                  className="chip text-xs px-3.5 py-1.5 rounded-full"
                  aria-label={`Search for ${term}`}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Active filter chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {companyFilter && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium chip-active">
                {companyFilter}
                <button
                  onClick={() => setCompanyFilter("")}
                  className="ml-0.5 hover:text-white/70"
                  aria-label={`Remove company filter: ${companyFilter}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </span>
            )}
            {JOB_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  typeFilter === type
                    ? "chip-active"
                    : "chip"
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
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  matchFilter
                    ? "chip-active"
                    : "chip"
                }`}
                aria-pressed={matchFilter}
                aria-label="Filter by 80% or higher match"
              >
                80%+ matches
              </button>
            )}
          </div>

          {/* Job Listings / Loading / Empty */}
          {loading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : displayJobs.length === 0 ? (
            <div className="text-center py-16 surface-card rounded-xl">
              <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <p className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-1">No jobs found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">Try a different search or filter</p>
              <Link href="/post" className="btn btn-primary btn-lg inline-flex items-center gap-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Post a Job
              </Link>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing <span className="font-semibold text-gray-700 dark:text-gray-300">{displayJobs.length}</span> job{displayJobs.length !== 1 ? "s" : ""}
                  {displayJobs.length !== jobs.length && (
                    <span className="text-gray-400 dark:text-gray-500"> (filtered from {jobs.length})</span>
                  )}
                </p>
                <Link
                  href="/analytics"
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  View insights &rarr;
                </Link>
              </div>
              <div className="grid gap-3">
                {displayJobs.map((job) => {
                  const match = matchResults.get(job.id) ?? null;
                  return (
                    <JobCard
                      key={job.id}
                      job={job}
                      match={match}
                      resumeSkills={resumeSkills}
                      savedJobs={savedJobs}
                      onToggleSave={toggleSave}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="mt-10 pt-6">
            <div className="divider mb-4" />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-sm">
                  <span className="text-[10px] font-bold text-white">T</span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">TechJobs</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">AI-Powered Job Search</span>
                </div>
              </div>
              <div className="flex items-center gap-5 text-xs text-gray-400 dark:text-gray-500">
                <a href="https://github.com/nikhilmangali1/job-board/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors font-medium" aria-label="GitHub">
                  GitHub
                </a>
                <a href="/analytics" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors font-medium">
                  Analytics
                </a>
                <span className="text-gray-300 dark:text-gray-600">Next.js, Neon, Vercel</span>
              </div>
            </div>
          </footer>
        </div>

        {/* Right column — Resume Analyzer sidebar (sticky) */}
        <aside id="resume-analyzer" className="min-w-0">
          <div className="surface-card rounded-xl overflow-y-auto sticky top-[69px] flex flex-col min-h-[calc(100vh-90px)] max-h-[calc(100vh-90px)]">
            <ResumeAnalyzer
              resumeText={resumeText}
              resumeSkills={resumeSkills}
              onAnalyze={(text, skills) => { setResumeText(text); setResumeSkills(skills); }}
              onClear={() => { setResumeText(""); setResumeSkills([]); }}
            />
          </div>
        </aside>
      </div>

      {/* Tablet / Mobile: single column (hidden on desktop) */}
      <div className="xl:hidden">
        {/* Statistics Section */}
        {stats && stats.totalJobs > 0 && (
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4" aria-label="Platform statistics">
            {[
              { label: "Total Jobs", value: stats.totalJobs, icon: "briefcase", color: "from-indigo-500 to-violet-500", border: "border-indigo-200/30 dark:border-indigo-500/20" },
              { label: "Companies", value: stats.totalCompanies, icon: "building", color: "from-violet-500 to-purple-500", border: "border-violet-200/30 dark:border-violet-500/20" },
              { label: "Avg Salary", value: stats.avgSalary ? `\u20B9${stats.avgSalary.toFixed(1)}L` : "\u2014", icon: "currency", color: "from-emerald-500 to-teal-500", border: "border-emerald-200/30 dark:border-emerald-500/20", isFormatted: true },
              { label: "New This Week", value: stats.jobsThisWeek, icon: "trending", color: "from-amber-500 to-orange-500", border: "border-amber-200/30 dark:border-amber-500/20" },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`relative overflow-hidden surface-card rounded-xl ${stat.border} p-3.5`}
              >
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-[0.04] dark:opacity-[0.08] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none`} />
                <div className="relative flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm`}>
                    {stat.icon === "briefcase" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                    ) : stat.icon === "building" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/></svg>
                    ) : stat.icon === "currency" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate font-medium">{stat.label}</p>
                    {stat.isFormatted ? (
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-px">{stat.value}</p>
                    ) : (
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums mt-px">
                        <AnimatedNumber value={typeof stat.value === "number" ? stat.value : 0} />
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Analytics + Recently Viewed */}
        {stats && stats.totalJobs > 0 && (
          <div className="mb-4">
            <div className="surface-card rounded-xl overflow-hidden">
              <InsightsPreview stats={stats} />
            </div>
            <RecentlyViewed />
          </div>
        )}

        {/* Resume Analyzer (inline on tablet/mobile) */}
        <div id="resume-analyzer" className="mb-4">
          <div className="surface-card rounded-xl overflow-hidden flex flex-col min-h-[400px]">
            <ResumeAnalyzer
              resumeText={resumeText}
              resumeSkills={resumeSkills}
              onAnalyze={(text, skills) => { setResumeText(text); setResumeSkills(skills); }}
              onClear={() => { setResumeText(""); setResumeSkills([]); }}
            />
          </div>
        </div>

        {/* Sticky Job Toolbar */}
        <div className="sticky top-[57px] z-10 surface-glass backdrop-blur-xl -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2.5 mb-3 border-b border-white/30 dark:border-white/[0.04] transition-colors">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                ref={searchRef}
                className="input w-full pl-9 pr-8 py-2 rounded-lg text-sm"
                aria-label="Search jobs"
              />
              {searchInput && (
                <button
                  onClick={() => { setSearchInput(""); setSearch(""); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Clear search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="select px-3 py-2 rounded-lg text-sm"
                aria-label="Sort jobs"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="salary">Salary (high-low)</option>
                {resumeSkills.length > 0 && <option value="bestmatch">Best Match</option>}
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  showFilters || locationFilter || minSalary || remoteOnly || companyFilter
                    ? "btn-primary"
                    : "btn-secondary"
                }`}
                aria-label={showFilters ? "Hide filters" : "Show filters"}
                aria-expanded={showFilters}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1 -mt-0.5"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><circle cx="4" cy="11" r="2"/><circle cx="12" cy="10" r="2"/><circle cx="20" cy="14" r="2"/></svg>
                Filters
              </button>
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="flex flex-wrap gap-3 mt-2.5 p-3.5 surface-card rounded-xl transition-colors" role="region" aria-label="Search filters">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5" htmlFor="filter-location">Location</label>
                <input
                  id="filter-location"
                  type="text"
                  placeholder="Filter by location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="input w-full px-3 py-2 rounded-lg text-sm"
                  aria-label="Filter by location"
                />
              </div>
              <div className="w-32">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5" htmlFor="filter-salary">Min Salary</label>
                <input
                  id="filter-salary"
                  type="number"
                  placeholder="e.g. 5"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  className="input w-full px-3 py-2 rounded-lg text-sm"
                  aria-label="Minimum salary in LPA"
                />
              </div>
              <div className="flex items-end pb-0.5">
                <button
                  onClick={() => setRemoteOnly(!remoteOnly)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    remoteOnly
                      ? "chip-active"
                      : "chip"
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

          {/* Popular search tags */}
          <div className="flex flex-wrap gap-2 mt-2.5 justify-center sm:justify-start">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium mr-1 self-center">Popular:</span>
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                onClick={() => { setSearchInput(term); setSearch(term); searchRef.current?.focus(); }}
                className="chip text-xs px-3.5 py-1.5 rounded-full"
                aria-label={`Search for ${term}`}
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Active filter chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {companyFilter && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium chip-active">
              {companyFilter}
              <button
                onClick={() => setCompanyFilter("")}
                className="ml-0.5 hover:text-white/70"
                aria-label={`Remove company filter: ${companyFilter}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </span>
          )}
          {JOB_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                typeFilter === type
                  ? "chip-active"
                  : "chip"
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
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                matchFilter
                  ? "chip-active"
                  : "chip"
              }`}
              aria-pressed={matchFilter}
              aria-label="Filter by 80% or higher match"
            >
              80%+ matches
            </button>
          )}
        </div>

        {/* Job Listings / Loading / Empty */}
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : displayJobs.length === 0 ? (
          <div className="text-center py-16 surface-card rounded-xl">
            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <p className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-1">No jobs found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">Try a different search or filter</p>
            <Link href="/post" className="btn btn-primary btn-lg inline-flex items-center gap-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Post a Job
            </Link>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing <span className="font-semibold text-gray-700 dark:text-gray-300">{displayJobs.length}</span> job{displayJobs.length !== 1 ? "s" : ""}
                {displayJobs.length !== jobs.length && (
                  <span className="text-gray-400 dark:text-gray-500"> (filtered from {jobs.length})</span>
                )}
              </p>
              <Link
                href="/analytics"
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                View insights &rarr;
              </Link>
            </div>
            <div className="grid gap-3">
              {displayJobs.map((job) => {
                const match = matchResults.get(job.id) ?? null;
                return (
                  <JobCard
                    key={job.id}
                    job={job}
                    match={match}
                    resumeSkills={resumeSkills}
                    savedJobs={savedJobs}
                    onToggleSave={toggleSave}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-10 pt-6">
          <div className="divider mb-4" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-sm">
                <span className="text-[10px] font-bold text-white">T</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">TechJobs</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">AI-Powered Job Search</span>
              </div>
            </div>
            <div className="flex items-center gap-5 text-xs text-gray-400 dark:text-gray-500">
              <a href="https://github.com/nikhilmangali1/job-board/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors font-medium" aria-label="GitHub">
                GitHub
              </a>
              <a href="/analytics" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors font-medium">
                Analytics
              </a>
              <span className="text-gray-300 dark:text-gray-600">Next.js, Neon, Vercel</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

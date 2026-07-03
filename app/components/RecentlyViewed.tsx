"use client";

import { useMemo } from "react";
import Link from "next/link";
import { relativeDate, getInitials, JOB_TYPE_STYLES } from "@/lib/utils";
import { computeMatch } from "@/lib/jobMatcher";
import { loadResume } from "@/lib/resumeParser";
import useRecentlyViewedJobs from "@/hooks/useRecentlyViewedJobs";
import MatchBadge from "./MatchBadge";

export default function RecentlyViewed() {
  const { recentlyViewed } = useRecentlyViewedJobs();

  const resumeSkills = useMemo(() => {
    const { skills } = loadResume();
    return skills;
  }, []);

  const matchResults = useMemo(() => {
    if (resumeSkills.length === 0) return new Map<number, ReturnType<typeof computeMatch>>();
    const map = new Map<number, ReturnType<typeof computeMatch>>();
    for (const job of recentlyViewed) {
      map.set(job.id, computeMatch(job, resumeSkills));
    }
    return map;
  }, [recentlyViewed, resumeSkills]);

  const displayJobs = recentlyViewed.slice(0, 5);

  if (displayJobs.length === 0) return null;

  return (
    <section aria-label="Recently viewed jobs" className="animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 dark:text-indigo-400">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <h2 className="label">
          Recently Viewed
        </h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {displayJobs.map((job) => {
          const match = matchResults.get(job.id) ?? null;
          return (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="group surface-card rounded-2xl p-4"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {getInitials(job.company)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {job.title}
                    </h3>
                    {resumeSkills.length > 0 && <MatchBadge score={match?.score ?? null} />}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                    {job.company} &middot; {job.location}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`badge ${JOB_TYPE_STYLES[job.type] || "badge-primary"}`}>
                      {job.type}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                      {relativeDate(new Date(job.viewed_at).toISOString())}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

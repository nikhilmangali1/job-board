"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { relativeDate, getInitials } from "@/lib/utils";
import { extractSkills } from "@/lib/resumeParser";
import MatchBadge from "./MatchBadge";
import MatchDetails from "./MatchDetails";
import type { JobMatch } from "@/lib/jobMatcher";

const AVATAR_GRADIENTS = [
  "from-indigo-500 to-violet-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-cyan-500 to-blue-500",
  "from-purple-500 to-fuchsia-500",
  "from-sky-500 to-indigo-500",
  "from-teal-500 to-cyan-500",
];

function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

const JOB_TYPE_STYLES: Record<string, string> = {
  "Full-time": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/30",
  "Part-time": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/30",
  "Contract": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/30",
  "Remote": "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-violet-200/50 dark:border-violet-800/30",
  "Internship": "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/30",
};

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

type Props = {
  job: Job;
  match: JobMatch | null;
  resumeSkills: string[];
  savedJobs: Set<number>;
  onToggleSave: (id: number) => void;
};

export default function JobCard({ job, match, resumeSkills, savedJobs, onToggleSave }: Props) {
  const router = useRouter();
  const skills = useMemo(() => {
    const extracted = extractSkills(`${job.title} ${job.description} ${job.requirements || ""}`);
    return [...new Set(extracted)].slice(0, 6);
  }, [job.title, job.description, job.requirements]);

  const displaySkills = skills.slice(0, 4);
  const extraCount = skills.length - 4;
  const gradient = getAvatarGradient(job.company);
  const isSaved = savedJobs.has(job.id);

  return (
    <div className="group relative surface-elevated overflow-hidden">
      <div className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-transparent via-indigo-400/0 to-transparent group-hover:via-indigo-400/40 dark:group-hover:via-indigo-400/30 transition-all duration-300" />
      <Link href={`/jobs/${job.id}`} className="block p-6">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md transition-transform duration-200 group-hover:scale-105`}>
            {getInitials(job.company)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                    {job.title}
                  </h2>
                  {match && match.score >= 80 && (
                    <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-500"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      Top Match
                    </span>
                  )}
                  {job.type === "Remote" && (
                    <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-2 py-0.5 rounded-full border border-violet-200/50 dark:border-violet-800/50">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                      Remote
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{job.company}</span>
                  {job.location && (
                    <>
                      <span className="text-gray-300 dark:text-gray-600">&middot;</span>
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {job.location}
                      </span>
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {resumeSkills.length > 0 && <MatchBadge score={match?.score ?? null} />}
              </div>
            </div>

            {job.salary_range && (
              <div className="flex items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200/50 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400 text-sm font-semibold shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  {job.salary_range}
                </span>
              </div>
            )}

            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {job.description}
            </p>

            {displaySkills.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                {displaySkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-100/80 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 border border-gray-200/50 dark:border-gray-700/30 transition-all duration-200 group-hover:border-indigo-200/50 dark:group-hover:border-indigo-800/30 group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                  >
                    {skill}
                  </span>
                ))}
                {extraCount > 0 && (
                  <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 px-1">
                    +{extraCount}
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/30">
              <div className="flex items-center gap-3">
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${JOB_TYPE_STYLES[job.type] || "bg-gray-100 text-gray-600 dark:bg-gray-800/60 dark:text-gray-400 border-gray-200/50 dark:border-gray-700/30"}`}>
                  {job.type}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {relativeDate(job.created_at)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSave(job.id); }}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    isSaved
                      ? "text-rose-500 bg-rose-50 dark:bg-rose-900/20 shadow-sm"
                      : "text-gray-400 hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-900/10 opacity-0 group-hover:opacity-100"
                  }`}
                  aria-label={isSaved ? "Remove from saved" : "Save job"}
                  title={isSaved ? "Remove from saved" : "Save job"}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
                <span className="w-px h-4 bg-gray-200 dark:bg-gray-700/50" />
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/jobs/${job.id}`); }}
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 opacity-0 group-hover:opacity-100 transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                >
                  Quick View &rarr;
                </button>
              </div>
            </div>

            {resumeSkills.length > 0 && match && (
              <MatchDetails match={match} />
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

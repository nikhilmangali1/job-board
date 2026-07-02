"use client";

import { useMemo, useState } from "react";
import { computeMatch } from "@/lib/jobMatcher";
import { highlightText } from "@/lib/fuzzySearch";
import MatchBadge from "@/app/components/MatchBadge";

type Props = {
  job: {
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
  query: string;
  isActive: boolean;
  index: number;
  resumeSkills: string[];
  onOpen: () => void;
  onCopyLink: () => void;
  onSave: () => void;
};

export default function JobResult({ job, query, isActive, index, resumeSkills, onOpen, onCopyLink, onSave }: Props) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const match = useMemo(() => {
    if (resumeSkills.length === 0) return null;
    return computeMatch(job, resumeSkills);
  }, [job, resumeSkills]);

  const titleSegments = useMemo(() => highlightText(job.title, query).segments, [job.title, query]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/jobs/${job.id}`);
    setCopied(true);
    onCopyLink();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const savedJobs = JSON.parse(localStorage.getItem("techjobs_saved") || "[]");
      if (!savedJobs.includes(job.id)) {
        savedJobs.push(job.id);
        localStorage.setItem("techjobs_saved", JSON.stringify(savedJobs));
      }
    } catch { /* ignore */ }
    setSaved(true);
    onSave();
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div
      data-palette-index={index}
      onClick={onOpen}
      className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors duration-75 cursor-pointer ${
        isActive
          ? "bg-blue-50 dark:bg-blue-900/20"
          : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
      }`}
      role="option"
      aria-selected={isActive}
    >
      <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-[10px] font-semibold shrink-0 mt-0.5">
        {job.company.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium truncate ${isActive ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-gray-100"}`}>
            {titleSegments.map((seg, i) =>
              seg.highlighted ? (
                <mark key={i} className="bg-yellow-200 dark:bg-yellow-700/40 text-inherit rounded-sm px-0.5">{seg.text}</mark>
              ) : (
                <span key={i}>{seg.text}</span>
              )
            )}
          </span>
          {resumeSkills.length > 0 && match && <MatchBadge score={match.score} />}
        </div>
        <div className="text-[11px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
          {job.company} &middot; {job.location} &middot; {job.type}
        </div>
      </div>
      <div className={`flex items-center gap-1 shrink-0 transition-opacity duration-75 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} onClick={(e) => e.stopPropagation()}>
        <span
          onClick={onOpen}
          className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer inline-flex"
          aria-label="Open job"
          title="Open"
          role="button"
          tabIndex={-1}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </span>
        <span
          onClick={handleCopy}
          className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer inline-flex"
          aria-label={copied ? "Link copied" : "Copy link"}
          title={copied ? "Copied!" : "Copy link"}
          role="button"
          tabIndex={-1}
        >
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          )}
        </span>
        <span
          onClick={handleSave}
          className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer inline-flex"
          aria-label={saved ? "Job saved" : "Save job"}
          title={saved ? "Saved!" : "Save job"}
          role="button"
          tabIndex={-1}
        >
          {saved ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-blue-500"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          )}
        </span>
      </div>
    </div>
  );
}

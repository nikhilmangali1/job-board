"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { relativeDate, getInitials, JOB_TYPE_STYLES } from "@/lib/utils";
import { computeMatch } from "@/lib/jobMatcher";
import { loadResume } from "@/lib/resumeParser";
import useRecentlyViewedJobs from "@/hooks/useRecentlyViewedJobs";
import useCompanyAnalytics from "@/hooks/useCompanyAnalytics";
import SkeletonDetail from "@/app/components/SkeletonDetail";
import MatchBadge from "@/app/components/MatchBadge";
import MatchDetails from "@/app/components/MatchDetails";
import { CompanyHoverCard } from "@/app/components/CompanyHoverCard";

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary_range: string | null;
  description: string;
  requirements: string | null;
  apply_url: string | null;
  created_at: string;
};

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [resumeSkills, setResumeSkills] = useState<string[]>([]);
  const { addJob } = useRecentlyViewedJobs();
  const { getProfile } = useCompanyAnalytics(allJobs);

  useEffect(() => {
    const { skills } = loadResume();
    setTimeout(() => setResumeSkills(skills), 0);
  }, []);

  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then((r) => r.json())
      .then((data) => setJob(data))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then(setAllJobs)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!job) return;
    addJob({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      salary_range: job.salary_range,
      description: job.description,
      requirements: job.requirements,
      created_at: job.created_at,
    });
  }, [job, addJob]);

  const match = useMemo(() => {
    if (!job || resumeSkills.length === 0) return null;
    return computeMatch(job, resumeSkills);
  }, [job, resumeSkills]);

  if (loading) return <SkeletonDetail />;
  if (!job) return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Job not found</div>;

  return (
    <div className="max-w-3xl">
      <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block" aria-label="Back to job listings">&larr; Back to jobs</Link>

      <div className="surface-elevated rounded-2xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-base font-semibold shrink-0">
            {getInitials(job.company)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{job.title}</h1>
                  {resumeSkills.length > 0 && match && <MatchBadge score={match.score} size="md" />}
                </div>
                <div className="text-gray-600 dark:text-gray-400 mt-1">
                  <CompanyHoverCard profile={getProfile(job.company)}>
                    {job.company}
                  </CompanyHoverCard> &middot; {job.location}
                </div>
              </div>
              <span className={`badge shrink-0 ${JOB_TYPE_STYLES[job.type] || ""}`}>{job.type}</span>
            </div>
          </div>
        </div>

        {match && (
          <div className="mb-4 p-4 surface-card rounded-xl">
            <MatchDetails match={match} />
          </div>
        )}

        {job.salary_range && (
          <p className="text-lg text-green-600 dark:text-green-400 font-semibold mb-4">{job.salary_range}</p>
        )}

        <div className="mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Description</h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{job.description}</p>
        </div>

        {job.requirements && (
          <div className="mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Requirements</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{job.requirements}</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-gray-400 dark:text-gray-500">{relativeDate(job.created_at)}</p>
          {job.apply_url && (
            <a
              href={job.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-md inline-flex items-center gap-1.5"
              aria-label="Apply for this job"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Apply Now
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

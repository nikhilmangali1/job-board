"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { relativeDate, getInitials, JOB_TYPE_STYLES } from "@/lib/utils";

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

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then((r) => r.json())
      .then((data) => setJob(data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading job details...</div>;
  if (!job) return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Job not found</div>;

  return (
    <div className="max-w-3xl">
      <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block">&larr; Back to jobs</Link>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 transition-colors">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-base font-semibold shrink-0">
            {getInitials(job.company)}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{job.title}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{job.company} &middot; {job.location}</p>
              </div>
              <span className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap ${JOB_TYPE_STYLES[job.type] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}>{job.type}</span>
            </div>
          </div>
        </div>

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

        <p className="text-xs text-gray-400 dark:text-gray-500 mt-6">{relativeDate(job.created_at)}</p>
      </div>
    </div>
  );
}

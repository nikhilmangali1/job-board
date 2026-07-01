"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

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

  if (loading) return <div className="text-center py-12 text-gray-500">Loading job details...</div>;
  if (!job) return <div className="text-center py-12 text-gray-500">Job not found</div>;

  return (
    <div className="max-w-3xl">
      <Link href="/" className="text-sm text-blue-600 hover:underline mb-4 inline-block">&larr; Back to jobs</Link>

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-gray-600 mt-1">{job.company} &middot; {job.location}</p>
          </div>
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">{job.type}</span>
        </div>

        {job.salary_range && (
          <p className="text-lg text-green-600 font-semibold mb-4">{job.salary_range}</p>
        )}

        <div className="mb-4">
          <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
        </div>

        {job.requirements && (
          <div className="mb-4">
            <h2 className="font-semibold text-gray-900 mb-2">Requirements</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{job.requirements}</p>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-6">
          Posted on {new Date(job.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Stats } from "@/lib/analytics";

function StatBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center min-w-0">
      <p className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{label}</p>
    </div>
  );
}

export default function InsightsPreview() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/analytics/summary")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  if (!stats || stats.totalJobs === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
      <div className="grid grid-cols-4 gap-3 mb-3">
        <StatBlock label="Jobs" value={stats.totalJobs} />
        <StatBlock label="Companies" value={stats.totalCompanies} />
        <StatBlock label="Avg Salary" value={stats.avgSalary ? `₹${stats.avgSalary.toFixed(1)}L` : "—"} />
        <StatBlock label="This Week" value={stats.jobsThisWeek} />
      </div>
      <Link
        href="/analytics"
        className="block text-center text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline py-1"
      >
        View all insights &rarr;
      </Link>
    </div>
  );
}

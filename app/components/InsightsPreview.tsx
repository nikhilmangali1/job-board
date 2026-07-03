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

type Props = {
  stats?: Stats | null;
};

export default function InsightsPreview({ stats: propStats }: Props) {
  const [localStats, setLocalStats] = useState<Stats | null>(null);

  const stats = propStats !== undefined ? propStats : localStats;

  useEffect(() => {
    if (propStats !== undefined) return;
    fetch("/api/analytics/summary")
      .then((r) => r.json())
      .then(setLocalStats)
      .catch(() => {});
  }, [propStats]);

  if (!stats || stats.totalJobs === 0) return null;

  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        </div>
        <span className="label mb-0">Market Overview</span>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <StatBlock label="Jobs" value={stats.totalJobs} />
        <StatBlock label="Companies" value={stats.totalCompanies} />
        <StatBlock label="Avg Salary" value={stats.avgSalary ? `\u20B9${stats.avgSalary.toFixed(1)}L` : "\u2014"} />
        <StatBlock label="This Week" value={stats.jobsThisWeek} />
      </div>
      <div className="divider my-3" />
      <Link
        href="/analytics"
        className="block text-center text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors py-1"
      >
        View all insights &rarr;
      </Link>
    </div>
  );
}

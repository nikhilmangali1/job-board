"use client";

import { type Stats } from "@/lib/analytics";
import AnimatedNumber from "./AnimatedNumber";

type Props = {
  stats: Stats;
};

export default function StatsCards({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      <StatCard
        label="Total Jobs"
        value={stats.totalJobs}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        }
        color="text-blue-500 bg-blue-50 dark:bg-blue-900/20"
      />
      <StatCard
        label="Companies"
        value={stats.totalCompanies}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        }
        color="text-purple-500 bg-purple-50 dark:bg-purple-900/20"
      />
      <StatCard
        label="Remote Jobs"
        value={stats.remoteJobs}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        }
        color="text-green-500 bg-green-50 dark:bg-green-900/20"
      />
      <StatCard
        label="Avg Salary"
        value={stats.avgSalary ?? 0}
        prefix="₹"
        suffix={stats.avgSalary ? ` ${Math.round(stats.avgSalary * 100000).toLocaleString("en-IN")}` : ""}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        }
        color="text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
      />
      <StatCard
        label="Highest Salary"
        value={stats.highestSalary ?? 0}
        prefix={stats.highestSalary ? "₹" : ""}
        suffix={stats.highestSalary ? ` ${Math.round(stats.highestSalary * 100000).toLocaleString("en-IN")}` : ""}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
        }
        color="text-orange-500 bg-orange-50 dark:bg-orange-900/20"
      />
      <StatCard
        label="Posted This Week"
        value={stats.jobsThisWeek}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        }
        color="text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20"
      />
    </div>
  );
}

function StatCard({ label, value, icon, color, prefix, suffix }: { label: string; value: number; icon: React.ReactNode; color: string; prefix?: string; suffix?: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/50 transition-all group">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{label}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-0.5">
            <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
          </p>
        </div>
      </div>
    </div>
  );
}

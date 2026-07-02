"use client";

import { type ReactNode } from "react";
import type { AnalyticsResult } from "@/lib/analytics";
import TechTrends from "./TechTrends";
import SalaryDistribution from "./SalaryDistribution";
import LocationHeatmap from "./LocationHeatmap";
import AIInsights from "./AIInsights";

type Props = {
  data: AnalyticsResult;
  children?: ReactNode;
};

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: ReactNode }) {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 flex items-center gap-3">
      <div className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{label}</p>
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{value}</p>
      </div>
    </div>
  );
}

export default function InsightsDashboard({ data, children }: Props) {
  const {
    stats: { totalJobs, totalCompanies, avgSalary, highestSalary },
    techTrends,
    salaryDistribution,
    locationHeatmap: locations,
    aiInsights,
  } = data;

  return (
    <section aria-label="Insights Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          label="Total Jobs Scraped"
          value={totalJobs}
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
        <StatCard
          label="Unique Companies"
          value={totalCompanies.toLocaleString()}
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
        />
        <StatCard
          label="Avg. Salary (LPA)"
          value={avgSalary ? `₹${avgSalary.toFixed(1)}` : "—"}
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
        />
        <StatCard
          label="Highest Salary (LPA)"
          value={highestSalary ? `₹${highestSalary.toFixed(1)}` : "—"}
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
          <TechTrends trends={techTrends} />
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
          <SalaryDistribution distribution={salaryDistribution} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
          <LocationHeatmap locations={locations} />
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
          <AIInsights insights={aiInsights} />
        </div>
      </div>

      {children && <div className="mt-6">{children}</div>}
    </section>
  );
}

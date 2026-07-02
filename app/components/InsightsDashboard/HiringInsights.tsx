"use client";

import { type HiringInsight } from "@/lib/analytics";
import { formatSalary } from "@/lib/salaryParser";

type Props = {
  insight: HiringInsight;
  onFilter?: (action: { type: string; value: string }) => void;
};

export default function HiringInsights({ insight, onFilter }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      <InsightCard
        label="Most Common Type"
        value={insight.mostCommonType.type}
        sub={insight.mostCommonType.count > 0 ? `${insight.mostCommonType.count} openings` : ""}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        }
        color="text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
        onClick={onFilter && insight.mostCommonType.count > 0 ? () => onFilter({ type: "type", value: insight.mostCommonType.type }) : undefined}
      />
      <InsightCard
        label="Top Hiring City"
        value={insight.mostActiveCity.city}
        sub={insight.mostActiveCity.count > 0 ? `${insight.mostActiveCity.count} jobs` : ""}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        }
        color="text-rose-500 bg-rose-50 dark:bg-rose-900/20"
        onClick={onFilter && insight.mostActiveCity.count > 0 ? () => onFilter({ type: "location", value: insight.mostActiveCity.city }) : undefined}
      />
      <InsightCard
        label="Top Company"
        value={insight.topCompany.company}
        sub={insight.topCompany.count > 0 ? `${insight.topCompany.count} positions` : ""}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        }
        color="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
      />
      <InsightCard
        label="Average Salary"
        value={insight.avgSalary ? formatSalary(insight.avgSalary) : "N/A"}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        }
        color="text-amber-500 bg-amber-50 dark:bg-amber-900/20"
      />
      <InsightCard
        label="Remote"
        value={`${insight.remotePercentage}%`}
        sub="of all openings"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        }
        color="text-sky-500 bg-sky-50 dark:bg-sky-900/20"
      />
    </div>
  );
}

function InsightCard({ label, value, sub, icon, color, onClick }: { label: string; value: string; sub?: string; icon: React.ReactNode; color: string; onClick?: () => void }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/50 transition-all ${onClick ? "cursor-pointer hover:ring-2 hover:ring-blue-500/40" : ""}`}
      aria-label={onClick ? `Filter by ${label}: ${value}` : undefined}
    >
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{label}</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{value}</p>
          {sub && <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{sub}</p>}
        </div>
      </div>
    </Tag>
  );
}

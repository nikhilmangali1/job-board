"use client";

import { useMemo } from "react";
import { type TechTrend } from "@/lib/analytics";

type Props = {
  trends: TechTrend[];
  onFilter?: (action: { type: string; value: string }) => void;
};

export default function TechTrends({ trends, onFilter }: Props) {
  const maxCount = useMemo(() => (trends.length > 0 ? trends[0].count : 1), [trends]);

  if (trends.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        Technology Trends
      </h3>
      <div className="space-y-2">
        {trends.map((trend, i) => (
          <button
            key={trend.skill}
            onClick={onFilter ? () => onFilter({ type: "search", value: trend.skill }) : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${onFilter ? "cursor-pointer" : ""}`}
            aria-label={onFilter ? `Filter by ${trend.skill}` : undefined}
          >
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-24 truncate text-left shrink-0">{trend.skill}</span>
            <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(trend.count / maxCount) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500 w-8 text-right shrink-0">{trend.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

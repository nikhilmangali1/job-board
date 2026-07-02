"use client";

import { useMemo } from "react";
import { type SalaryBucket } from "@/lib/analytics";

type Props = {
  distribution: SalaryBucket[];
  onFilter?: (action: { type: string; value: string }) => void;
};

export default function SalaryDistribution({ distribution, onFilter }: Props) {
  const maxCount = useMemo(() => (distribution.length > 0 ? Math.max(...distribution.map((b) => b.count)) : 1), [distribution]);

  if (distribution.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        Salary Distribution
      </h3>
      <div className="space-y-2">
        {distribution.map((bucket) => (
          <button
            key={bucket.bucket}
            onClick={onFilter ? () => onFilter({ type: "minSalary", value: String(bucket.minLpa * 100000) }) : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${onFilter ? "cursor-pointer" : ""}`}
            aria-label={onFilter ? `Filter by salary ${bucket.bucket}` : undefined}
          >
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-20 truncate text-left shrink-0">{bucket.bucket}</span>
            <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 dark:bg-green-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(bucket.count / maxCount) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500 w-8 text-right shrink-0">{bucket.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

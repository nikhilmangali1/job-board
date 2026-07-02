"use client";

import { useMemo } from "react";
import { type LocationEntry } from "@/lib/analytics";

type Props = {
  locations: LocationEntry[];
  onFilter?: (action: { type: string; value: string }) => void;
};

export default function LocationHeatmap({ locations, onFilter }: Props) {
  const maxCount = useMemo(() => (locations.length > 0 ? locations[0].count : 1), [locations]);

  if (locations.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        Top Locations
      </h3>
      <div className="space-y-2">
        {locations.map((entry) => (
          <button
            key={entry.location}
            onClick={onFilter ? () => onFilter({ type: "location", value: entry.location }) : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${onFilter ? "cursor-pointer" : ""}`}
            aria-label={onFilter ? `Filter by location ${entry.location}` : undefined}
          >
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-28 truncate text-left shrink-0">{entry.location}</span>
            <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 dark:bg-purple-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(entry.count / maxCount) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500 w-8 text-right shrink-0">{entry.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

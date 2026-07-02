"use client";

import { type RecentItem } from "@/lib/recentStorage";

type Props = {
  items: RecentItem[];
  onSelect: (item: RecentItem) => void;
};

const TYPE_LABELS: Record<string, string> = {
  command: "Command",
  job: "Job",
  search: "Search",
};

export default function RecentGroup({ items, onSelect }: Props) {
  if (items.length === 0) return null;

  return (
    <div role="group" aria-label="Recent">
      <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
        Recent
      </div>
      {items.map((item) => (
        <button
          key={`${item.type}-${item.id}`}
          onClick={() => onSelect(item)}
          className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-75"
          role="option"
          aria-selected={false}
          aria-label={`${TYPE_LABELS[item.type] || "Recent"}: ${item.label}`}
        >
          <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 w-14 shrink-0">
            {TYPE_LABELS[item.type] || "Recent"}
          </span>
          <span className="truncate">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

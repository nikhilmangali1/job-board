"use client";

import { getInitials } from "@/lib/utils";
import type { HiringActivity } from "@/lib/companyAnalytics";

type Props = {
  company: string;
  jobCount: number;
  activity: HiringActivity;
};

const ACTIVITY_CONFIG: Record<HiringActivity, { label: string; dot: string }> = {
  very_active: { label: "Very Active", dot: "bg-green-500" },
  active: { label: "Active", dot: "bg-blue-500" },
  occasional: { label: "Occasional", dot: "bg-yellow-500" },
};

export default function CompanyHeader({ company, jobCount, activity }: Props) {
  const cfg = ACTIVITY_CONFIG[activity];
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
        {getInitials(company)}
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate block">{company}</span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          <span className="text-[11px] text-gray-500 dark:text-gray-400">{cfg.label}</span>
          <span className="text-[11px] text-gray-300 dark:text-gray-600">&middot;</span>
          <span className="text-[11px] text-gray-500 dark:text-gray-400">{jobCount} job{jobCount !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </div>
  );
}

"use client";

type Props = {
  avgSalary: number | null;
  locationCount: number;
  mostCommonJobType: string;
  remoteFraction: number;
};

export default function CompanyStats({ avgSalary, locationCount, mostCommonJobType, remoteFraction }: Props) {
  const remoteLabel = remoteFraction >= 0.5 ? "Remote-friendly" : remoteFraction > 0 ? "Some remote" : "On-site";

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3 text-xs">
      <div>
        <span className="text-gray-400 dark:text-gray-500">Avg Salary</span>
        <p className="font-medium text-gray-800 dark:text-gray-200">{avgSalary ? `₹${avgSalary.toFixed(1)}L` : "—"}</p>
      </div>
      <div>
        <span className="text-gray-400 dark:text-gray-500">Locations</span>
        <p className="font-medium text-gray-800 dark:text-gray-200">{locationCount}</p>
      </div>
      <div>
        <span className="text-gray-400 dark:text-gray-500">Common Type</span>
        <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{mostCommonJobType || "—"}</p>
      </div>
      <div>
        <span className="text-gray-400 dark:text-gray-500">Remote</span>
        <p className="font-medium text-gray-800 dark:text-gray-200">{remoteLabel}</p>
      </div>
    </div>
  );
}

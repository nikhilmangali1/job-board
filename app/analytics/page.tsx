import { query } from "@/db";
import { computeAnalytics, type Job } from "@/lib/analytics";
import { InsightsDashboard } from "@/app/components/InsightsDashboard";

export const metadata = {
  title: "Analytics",
  description: "Job market insights and trends",
};

export default async function AnalyticsPage() {
  const jobs = (await query`SELECT * FROM jobs ORDER BY created_at DESC`) as Job[];
  const data = computeAnalytics(jobs);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Market Insights</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Analytics across {data.stats.totalJobs} scraped job listings
          </p>
        </div>
        <InsightsDashboard data={data} />
      </div>
    </main>
  );
}

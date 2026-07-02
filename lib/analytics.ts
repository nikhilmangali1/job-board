import { extractSkills } from "./skillDictionary";
import { parseSalary, getSalaryBucket } from "./salaryParser";

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary_range: string | null;
  description: string;
  requirements: string | null;
  created_at: string;
};

export type Stats = {
  totalJobs: number;
  totalCompanies: number;
  remoteJobs: number;
  avgSalary: number | null;
  highestSalary: number | null;
  jobsThisWeek: number;
};

export type HiringInsight = {
  mostCommonType: { type: string; count: number };
  mostActiveCity: { city: string; count: number };
  topCompany: { company: string; count: number };
  avgSalary: number | null;
  remotePercentage: number;
};

export type TechTrend = {
  skill: string;
  count: number;
};

export type SalaryBucket = {
  bucket: string;
  count: number;
  minLpa: number;
};

export type LocationEntry = {
  location: string;
  count: number;
};

export type AIInsight = {
  text: string;
  icon: string;
};

export type AnalyticsResult = {
  stats: Stats;
  hiringInsight: HiringInsight;
  techTrends: TechTrend[];
  salaryDistribution: SalaryBucket[];
  locationHeatmap: LocationEntry[];
  aiInsights: AIInsight[];
};

export function computeStats(jobs: Job[]): Stats {
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const companies = new Set(jobs.map((j) => j.company.toLowerCase()));
  const salaries = jobs
    .map((j) => parseSalary(j.salary_range))
    .filter((s): s is number => s !== null);

  return {
    totalJobs: jobs.length,
    totalCompanies: companies.size,
    remoteJobs: jobs.filter((j) => j.type === "Remote" || /remote/i.test(j.location)).length,
    avgSalary: salaries.length > 0 ? Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length * 10) / 10 : null,
    highestSalary: salaries.length > 0 ? Math.max(...salaries) : null,
    jobsThisWeek: jobs.filter((j) => new Date(j.created_at).getTime() > weekAgo).length,
  };
}

export function computeHiringInsights(jobs: Job[]): HiringInsight {
  const typeCount = new Map<string, number>();
  const cityCount = new Map<string, number>();
  const companyCount = new Map<string, number>();
  const salaries: number[] = [];
  let remoteCount = 0;

  for (const job of jobs) {
    typeCount.set(job.type, (typeCount.get(job.type) || 0) + 1);
    cityCount.set(job.location, (cityCount.get(job.location) || 0) + 1);
    companyCount.set(job.company, (companyCount.get(job.company) || 0) + 1);
    const s = parseSalary(job.salary_range);
    if (s !== null) salaries.push(s);
    if (job.type === "Remote" || /remote/i.test(job.location)) remoteCount++;
  }

  const byValue = (m: Map<string, number>) => [...m.entries()].sort((a, b) => b[1] - a[1]);

  const topType = byValue(typeCount)[0];
  const topCity = byValue(cityCount)[0];
  const topComp = byValue(companyCount)[0];

  return {
    mostCommonType: topType ? { type: topType[0], count: topType[1] } : { type: "N/A", count: 0 },
    mostActiveCity: topCity ? { city: topCity[0], count: topCity[1] } : { city: "N/A", count: 0 },
    topCompany: topComp ? { company: topComp[0], count: topComp[1] } : { company: "N/A", count: 0 },
    avgSalary: salaries.length > 0 ? Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length * 10) / 10 : null,
    remotePercentage: jobs.length > 0 ? Math.round((remoteCount / jobs.length) * 100) : 0,
  };
}

export function computeTechTrends(jobs: Job[]): TechTrend[] {
  const skillCount = new Map<string, number>();

  for (const job of jobs) {
    const combined = `${job.title} ${job.description} ${job.requirements || ""}`;
    const skills = extractSkills(combined);
    for (const skill of skills) {
      skillCount.set(skill, (skillCount.get(skill) || 0) + 1);
    }
  }

  return [...skillCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill, count]) => ({ skill, count }));
}

export function computeSalaryDistribution(jobs: Job[]): SalaryBucket[] {
  const buckets = new Map<string, { count: number; minLpa: number }>();
  const bucketOrder = ["<5 LPA", "5-10 LPA", "10-20 LPA", "20+ LPA"];
  for (const b of bucketOrder) {
    const min = b === "<5 LPA" ? 0 : b === "5-10 LPA" ? 5 : b === "10-20 LPA" ? 10 : 20;
    buckets.set(b, { count: 0, minLpa: min });
  }

  for (const job of jobs) {
    const lpa = parseSalary(job.salary_range);
    if (lpa === null) continue;
    const bucket = getSalaryBucket(lpa);
    const existing = buckets.get(bucket);
    if (existing) {
      existing.count++;
    }
  }

  return bucketOrder
    .map((bucket) => ({ bucket, count: buckets.get(bucket)?.count ?? 0, minLpa: buckets.get(bucket)?.minLpa ?? 0 }))
    .filter((b) => b.count > 0);
}

export function computeLocationHeatmap(jobs: Job[]): LocationEntry[] {
  const locationCount = new Map<string, number>();
  for (const job of jobs) {
    locationCount.set(job.location, (locationCount.get(job.location) || 0) + 1);
  }
  return [...locationCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([location, count]) => ({ location, count }));
}

export function computeAIInsights(jobs: Job[], techTrends: TechTrend[], hiringInsight: HiringInsight): AIInsight[] {
  const insights: AIInsight[] = [];

  if (techTrends.length > 0) {
    const top = techTrends[0];
    const pct = Math.round((top.count / jobs.length) * 100);
    insights.push({ text: `${top.skill} appears in ${pct}% of ${jobs.length} job listings.`, icon: "trending" });
  }

  if (techTrends.length > 1) {
    const second = techTrends[1];
    const pct = Math.round((second.count / jobs.length) * 100);
    insights.push({ text: `${second.skill} is mentioned in ${pct}% of openings.`, icon: "trending" });
  }

  if (hiringInsight.remotePercentage > 0) {
    insights.push({ text: `Remote positions account for ${hiringInsight.remotePercentage}% of all openings.`, icon: "remote" });
  }

  if (hiringInsight.mostCommonType.count > 0) {
    insights.push({
      text: `${hiringInsight.mostCommonType.type} roles dominate with ${hiringInsight.mostCommonType.count} openings.`,
      icon: "type",
    });
  }

  if (hiringInsight.topCompany.count > 1) {
    insights.push({
      text: `${hiringInsight.topCompany.company} is the top hiring company with ${hiringInsight.topCompany.count} positions.`,
      icon: "company",
    });
  }

  return insights;
}

export function computeAnalytics(jobs: Job[]): AnalyticsResult {
  const stats = computeStats(jobs);
  const hiringInsight = computeHiringInsights(jobs);
  const techTrends = computeTechTrends(jobs);
  const salaryDistribution = computeSalaryDistribution(jobs);
  const locationHeatmap = computeLocationHeatmap(jobs);
  const aiInsights = computeAIInsights(jobs, techTrends, hiringInsight);

  return { stats, hiringInsight, techTrends, salaryDistribution, locationHeatmap, aiInsights };
}

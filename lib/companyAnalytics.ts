import { extractSkills } from "./skillDictionary";
import { parseSalary } from "./salaryParser";
import type { Job } from "./analytics";

export type HiringActivity = "very_active" | "active" | "occasional";

export type CompanyProfile = {
  company: string;
  jobCount: number;
  avgSalary: number | null;
  topTechnologies: string[];
  hiringLocations: string[];
  mostCommonJobType: string;
  latestPostedAt: string;
  remoteFraction: number;
  hiringActivity: HiringActivity;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function computeActivity(jobCount: number, recentCount: number): HiringActivity {
  if (jobCount === 0) return "occasional";
  const ratio = recentCount / jobCount;
  if (ratio >= 0.3) return "very_active";
  if (ratio >= 0.1) return "active";
  return "occasional";
}

export function computeCompanyProfile(companyName: string, allJobs: Job[]): CompanyProfile {
  const jobs = allJobs.filter((j) => j.company.toLowerCase() === companyName.toLowerCase());

  if (jobs.length === 0) {
    return {
      company: companyName,
      jobCount: 0,
      avgSalary: null,
      topTechnologies: [],
      hiringLocations: [],
      mostCommonJobType: "",
      latestPostedAt: "",
      remoteFraction: 0,
      hiringActivity: "occasional",
    };
  }

  const salaries = jobs.map((j) => parseSalary(j.salary_range)).filter((s): s is number => s !== null);
  const avgSalary = salaries.length > 0 ? salaries.reduce((a, b) => a + b, 0) / salaries.length : null;

  const techCount = new Map<string, number>();
  for (const job of jobs) {
    const combined = `${job.title} ${job.description} ${job.requirements || ""}`;
    const skills = extractSkills(combined);
    for (const skill of skills) {
      techCount.set(skill, (techCount.get(skill) || 0) + 1);
    }
  }
  const topTechnologies = [...techCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill]) => skill);

  const locations = [...new Set(jobs.map((j) => j.location))];
  const typeCount = new Map<string, number>();
  for (const job of jobs) {
    typeCount.set(job.type, (typeCount.get(job.type) || 0) + 1);
  }
  const mostCommonJobType = [...typeCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "";

  const sorted = [...jobs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const latestPostedAt = sorted[0]?.created_at || "";

  const remoteCount = jobs.filter((j) => j.type === "Remote" || /remote/i.test(j.location)).length;
  const remoteFraction = jobs.length > 0 ? remoteCount / jobs.length : 0;

  const now = Date.now();
  const recentCount = jobs.filter((j) => new Date(j.created_at).getTime() > now - WEEK_MS).length;
  const hiringActivity = computeActivity(jobs.length, recentCount);

  return {
    company: companyName,
    jobCount: jobs.length,
    avgSalary: avgSalary !== null ? Math.round(avgSalary * 10) / 10 : null,
    topTechnologies,
    hiringLocations: locations,
    mostCommonJobType,
    latestPostedAt,
    remoteFraction,
    hiringActivity,
  };
}

export function computeAllCompanyProfiles(allJobs: Job[]): Map<string, CompanyProfile> {
  const companies = [...new Set(allJobs.map((j) => j.company.toLowerCase()))];
  const map = new Map<string, CompanyProfile>();
  for (const company of companies) {
    const originalName = allJobs.find((j) => j.company.toLowerCase() === company)?.company || company;
    const profile = computeCompanyProfile(originalName, allJobs);
    map.set(company.toLowerCase(), profile);
  }
  return map;
}

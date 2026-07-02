import { extractSkills } from "./resumeParser";

type Job = {
  id: number;
  title: string;
  description: string;
  requirements: string | null;
};

export type JobMatch = {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
};

function intersect(a: string[], b: string[]): string[] {
  const setB = new Set(b);
  return a.filter((s) => setB.has(s));
}

function difference(a: string[], b: string[]): string[] {
  const setB = new Set(b);
  return a.filter((s) => !setB.has(s));
}

export function computeMatch(job: Job, resumeSkills: string[]): JobMatch {
  const titleSkills = extractSkills(job.title);
  const descSkills = extractSkills(job.description || "");
  const reqSkills = extractSkills(job.requirements || "");

  const allJobSkills = new Set([...titleSkills, ...descSkills, ...reqSkills]);

  let totalWeight = 0;
  let matchedWeight = 0;

  for (const skill of allJobSkills) {
    const weight =
      (titleSkills.includes(skill) ? 3 : 0) +
      (reqSkills.includes(skill) ? 2 : 0) +
      (descSkills.includes(skill) ? 1 : 0);
    totalWeight += weight;
    if (resumeSkills.includes(skill)) {
      matchedWeight += weight;
    }
  }

  const score = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;
  const matchedSkills = intersect(Array.from(allJobSkills), resumeSkills);
  const missingSkills = difference(Array.from(allJobSkills), resumeSkills);

  return { score, matchedSkills, missingSkills };
}

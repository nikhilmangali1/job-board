import { useState, useEffect, useCallback } from "react";
import { allSkills, allSkillsLower } from "./skillDictionary";

export function extractSkills(text: string): string[] {
  if (!text.trim()) return [];
  const lower = text.toLowerCase();
  const found = new Set<string>();

  for (let i = 0; i < allSkillsLower.length; i++) {
    if (lower.includes(allSkillsLower[i])) {
      found.add(allSkills[i]);
    }
  }

  return Array.from(found).sort();
}

const RESUME_KEY = "techjobs_resume";
const SKILLS_KEY = "techjobs_resume_skills";

export function saveResume(text: string, skills: string[]): void {
  try {
    localStorage.setItem(RESUME_KEY, text);
    localStorage.setItem(SKILLS_KEY, JSON.stringify(skills));
  } catch { /* localStorage full or unavailable */ }
}

export function loadResume(): { text: string; skills: string[] } {
  try {
    const text = localStorage.getItem(RESUME_KEY) || "";
    const skillsRaw = localStorage.getItem(SKILLS_KEY);
    const skills = skillsRaw ? JSON.parse(skillsRaw) : [];
    return { text, skills };
  } catch {
    return { text: "", skills: [] };
  }
}

export function clearResume(): void {
  try {
    localStorage.removeItem(RESUME_KEY);
    localStorage.removeItem(SKILLS_KEY);
  } catch { /* ignore */ }
}

export function useResume() {
  const [resumeText, setResumeText] = useState("");
  const [resumeSkills, setResumeSkills] = useState<string[]>([]);

  useEffect(() => {
    const { text, skills } = loadResume();
    setTimeout(() => { setResumeText(text); setResumeSkills(skills); }, 0);
  }, []);

  const analyze = useCallback((text: string) => {
    const skills = extractSkills(text);
    setResumeText(text);
    setResumeSkills(skills);
    saveResume(text, skills);
  }, []);

  const clear = useCallback(() => {
    setResumeText("");
    setResumeSkills([]);
    clearResume();
  }, []);

  return { resumeText, resumeSkills, analyze, clear };
}

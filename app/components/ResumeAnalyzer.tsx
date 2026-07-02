"use client";

import { useRef, useState } from "react";
import { extractSkills, saveResume } from "@/lib/resumeParser";
import SkillChip from "./SkillChip";

type Props = {
  resumeText: string;
  resumeSkills: string[];
  onAnalyze: (text: string, skills: string[]) => void;
  onClear: () => void;
};

export default function ResumeAnalyzer({ resumeText, resumeSkills, onAnalyze, onClear }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [inputText, setInputText] = useState(resumeText);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const hasResume = resumeSkills.length > 0;

  const handleAnalyze = async (text: string) => {
    if (!text.trim()) {
      setError("Please paste or upload resume text");
      return;
    }
    setAnalyzing(true);
    setError("");
    await new Promise((r) => setTimeout(r, 300));
    const skills = extractSkills(text);
    saveResume(text, skills);
    onAnalyze(text, skills);
    setAnalyzing(false);
    setExpanded(false);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".txt")) {
      setError("Only .txt files are supported currently");
      return;
    }
    try {
      const text = await file.text();
      setInputText(text);
      await handleAnalyze(text);
    } catch {
      setError("Could not read file");
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  if (!expanded && hasResume) {
    return (
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl border-l-4 border-blue-500 dark:border-blue-400 shadow-sm transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Resume loaded</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{resumeSkills.length} skill{resumeSkills.length !== 1 ? "s" : ""} detected</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setExpanded(true); setInputText(resumeText); }}
              className="text-xs px-3 py-1.5 rounded-lg border dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Edit resume"
            >
              Edit
            </button>
            <button
              onClick={onClear}
              className="text-xs px-3 py-1.5 rounded-lg border dark:border-gray-600 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              aria-label="Clear resume"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {resumeSkills.slice(0, 10).map((s) => (
            <SkillChip key={s} skill={s} matched />
          ))}
          {resumeSkills.length > 10 && (
            <span className="text-xs text-gray-400 dark:text-gray-500 self-center">+{resumeSkills.length - 10} more</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm transition-colors">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-xl transition-colors"
        aria-expanded={expanded}
        aria-label="Resume analyzer"
      >
        <span className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          Resume Analyzer
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${expanded ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3" role="region" aria-label="Resume input">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Paste your resume text or upload a .txt file to see match scores with each job.
          </p>

          <div aria-live="polite" className="sr-only">
            {analyzing ? "Analyzing resume..." : ""}
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your resume text here..."
            rows={5}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 text-sm resize-none"
            aria-label="Resume text"
          />

          {error && <p className="text-sm text-red-500 dark:text-red-400" role="alert">{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={() => handleAnalyze(inputText)}
              disabled={analyzing}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors"
              aria-label="Analyze resume"
            >
              {analyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Analyzing...
                </span>
              ) : (
                "Analyze Resume"
              )}
            </button>

            <label className="flex items-center justify-center px-4 py-2 rounded-lg border dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium cursor-pointer transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Upload .txt
              <input ref={fileRef} type="file" accept=".txt" onChange={handleFile} className="hidden" aria-label="Upload text file" />
            </label>
          </div>

          {resumeSkills.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Detected skills ({resumeSkills.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {resumeSkills.map((s) => (
                  <SkillChip key={s} skill={s} matched />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

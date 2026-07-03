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

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center gap-2 px-4 pt-4 pb-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 dark:text-indigo-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        </div>
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Resume Analyzer</span>
        {hasResume && (
          <span className="badge badge-success ml-auto">{resumeSkills.length} skills</span>
        )}
      </div>

      <div className="flex-1 flex flex-col px-4 pb-4 space-y-3 min-h-0" role="region" aria-label="Resume input">
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
          className="textarea w-full flex-1 px-3 py-2 rounded-lg text-sm resize-none min-h-[120px]"
          aria-label="Resume text"
        />

        {error && <p className="text-sm text-rose-500 dark:text-rose-400" role="alert">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={() => handleAnalyze(inputText)}
            disabled={analyzing}
            className="btn btn-primary btn-md flex-1"
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

          <label className="btn btn-secondary btn-md cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Upload .txt
            <input ref={fileRef} type="file" accept=".txt" onChange={handleFile} className="hidden" aria-label="Upload text file" />
          </label>
        </div>

        {hasResume && (
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Detected skills ({resumeSkills.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {resumeSkills.map((s) => (
                <SkillChip key={s} skill={s} matched />
              ))}
            </div>
          </div>
        )}

        {hasResume && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClear}
              className="text-xs px-3 py-1.5 rounded-lg border border-rose-200/50 dark:border-rose-500/20 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
              aria-label="Clear resume"
            >
              Clear Resume
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

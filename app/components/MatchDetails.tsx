"use client";

import { useState } from "react";
import SkillChip from "./SkillChip";
import type { JobMatch } from "@/lib/jobMatcher";

type Props = {
  match: JobMatch | null;
};

export default function MatchDetails({ match }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!match || (match.score === 0 && match.matchedSkills.length === 0 && match.missingSkills.length === 0)) return null;

  return (
    <div className="mt-3 pt-3 border-t dark:border-gray-700">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        aria-expanded={expanded}
        aria-label="Toggle match details"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${expanded ? "rotate-90" : ""}`}><polyline points="9 18 15 12 9 6"/></svg>
        Match details
      </button>

      {expanded && (
        <div className="mt-2 space-y-2 animate-fade-in">
          {match.matchedSkills.length > 0 && (
            <div>
              <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Matched ({match.matchedSkills.length})</p>
              <div className="flex flex-wrap gap-1">
                {match.matchedSkills.map((s) => (
                  <SkillChip key={s} skill={s} matched />
                ))}
              </div>
            </div>
          )}

          {match.missingSkills.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Missing ({match.missingSkills.length})</p>
              <div className="flex flex-wrap gap-1">
                {match.missingSkills.map((s) => (
                  <SkillChip key={s} skill={s} matched={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

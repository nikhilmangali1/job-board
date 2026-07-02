type Props = {
  skill: string;
  matched: boolean;
};

export default function SkillChip({ skill, matched }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
        matched
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
      }`}
      aria-label={`${skill}${matched ? " — matched" : " — missing"}`}
    >
      {matched ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polyline points="20 6 9 17 4 12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      )}
      {skill}
    </span>
  );
}

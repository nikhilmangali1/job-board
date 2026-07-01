export function relativeDate(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 60) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function getInitials(name: string): string {
  return name.charAt(0).toUpperCase();
}

export const JOB_TYPE_STYLES: Record<string, string> = {
  "Full-time": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "Part-time": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Contract": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "Remote": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "Internship": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
};

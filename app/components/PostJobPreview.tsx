"use client";

type PreviewData = {
  title: string;
  company: string;
  location: string;
  type: string;
  salary_range: string;
  description: string;
  requirements: string;
  apply_url: string;
};

export default function PostJobPreview({ data }: { data: PreviewData }) {
  const hasContent = data.title || data.company || data.location || data.salary_range || data.description;

  if (!hasContent) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/20 dark:to-violet-900/20 flex items-center justify-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400 dark:text-indigo-500"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        </div>
        <p className="text-sm font-medium text-gray-400 dark:text-gray-500">Your job preview</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Start filling in the form to see a live preview</p>
      </div>
    );
  }

  return (
    <div className="surface-elevated overflow-hidden rounded-2xl">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-base font-bold shrink-0">
            {data.company.charAt(0).toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {data.title || "Untitled Position"}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                  {data.company || "Company"} &middot; {data.location || "Location"}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {data.type && (
                  <span className="badge badge-primary text-[10px]">
                    {data.type}
                  </span>
                )}
              </div>
            </div>
            {data.salary_range && (
              <div className="inline-flex items-center gap-1 mt-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{data.salary_range}</span>
              </div>
            )}
            {data.description && (
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">
                {data.description}
              </p>
            )}
            {data.requirements && (
              <div className="mt-3">
                <h4 className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Requirements</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">
                  {data.requirements}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="px-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-gray-400 dark:text-gray-500">Live preview</span>
        </div>
        {data.apply_url && (
          <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium">Apply link set</span>
        )}
      </div>
    </div>
  );
}

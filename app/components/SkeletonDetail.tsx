export default function SkeletonDetail() {
  return (
    <div className="max-w-3xl animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4" />
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
          <div className="flex-1">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
        </div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4" />
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
      </div>
    </div>
  );
}

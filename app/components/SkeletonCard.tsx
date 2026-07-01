export default function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border dark:border-gray-700 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      </div>
    </div>
  );
}

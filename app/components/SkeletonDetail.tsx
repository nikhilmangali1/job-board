export default function SkeletonDetail() {
  return (
    <div className="max-w-3xl animate-pulse">
      <div className="h-4 skeleton rounded w-24 mb-4" />
      <div className="surface-elevated rounded-2xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full skeleton shrink-0" />
          <div className="flex-1">
            <div className="h-6 skeleton rounded w-3/4 mb-2" />
            <div className="h-4 skeleton rounded w-1/2" />
          </div>
          <div className="h-6 skeleton rounded-full w-20" />
        </div>
        <div className="h-5 skeleton rounded w-40 mb-4" />
        <div className="space-y-2 mb-4">
          <div className="h-4 skeleton rounded w-full" />
          <div className="h-4 skeleton rounded w-full" />
          <div className="h-4 skeleton rounded w-3/4" />
        </div>
        <div className="h-4 skeleton rounded w-32" />
      </div>
    </div>
  );
}

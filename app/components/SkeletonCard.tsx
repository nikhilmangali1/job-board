export default function SkeletonCard() {
  return (
    <div className="surface-elevated rounded-2xl p-5 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl skeleton" />
            <div className="flex-1 space-y-2">
              <div className="h-4 skeleton w-3/4" />
              <div className="h-3 skeleton w-1/2" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 skeleton w-full" />
            <div className="h-3 skeleton w-2/3" />
          </div>
        </div>
        <div className="h-8 w-20 skeleton rounded-full ml-3" />
      </div>
    </div>
  );
}

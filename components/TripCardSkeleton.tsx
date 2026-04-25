export default function TripCardSkeleton() {
  return (
    <div className="rounded-2xl p-5 border border-gray-100 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-full arbi-skeleton" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-24 rounded arbi-skeleton" />
          <div className="h-2.5 w-16 rounded arbi-skeleton" />
        </div>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 w-5 rounded arbi-skeleton" />
        <div className="h-5 w-5 rounded arbi-skeleton" />
        <div className="h-3 w-32 rounded arbi-skeleton ml-1" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-3 w-28 rounded arbi-skeleton" />
        <div className="h-6 w-12 rounded-full arbi-skeleton" />
      </div>
    </div>
  );
}

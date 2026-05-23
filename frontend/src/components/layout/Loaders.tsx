export function GlobalSkeleton() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999] transition-opacity">
      <div className="w-16 h-16 rounded-lg bg-gray-200 border border-gray-300 animate-pulse flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-gray-300 border-t-black animate-spin" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 w-full max-w-7xl mx-auto px-4 md:px-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col animate-pulse">
          <div className="bg-gray-200 rounded-lg aspect-square w-full mb-3" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
      ))}
    </div>
  );
}

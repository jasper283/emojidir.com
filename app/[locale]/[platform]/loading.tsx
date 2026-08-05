export default function Loading() {
  return (
    <div className="min-h-screen bg-transparent">
      {/* Header Skeleton */}
      <div className="w-full bg-background/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
          <div className="text-center mb-6">
            <div className="mx-auto mb-2 h-10 w-64 animate-pulse rounded-2xl bg-muted" />
            <div className="mx-auto h-4 w-96 max-w-full animate-pulse rounded-full bg-muted" />
          </div>
          <div className="flex justify-center">
            <div className="clay-card-soft h-16 w-full max-w-2xl animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 md:px-6">
        {/* Sidebar Skeleton */}
        <aside className="clay-card-soft hidden w-80 p-6 md:block">
          <div className="space-y-6">
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-10 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        </aside>

        {/* Grid Skeleton */}
        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6 flex justify-between">
            <div className="h-6 w-40 bg-muted animate-pulse rounded" />
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 md:gap-4">
            {[...Array(56)].map((_, i) => (
              <div
                key={i}
                className="clay-card-soft aspect-square animate-pulse"
                style={{ animationDelay: `${i * 20}ms` }}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

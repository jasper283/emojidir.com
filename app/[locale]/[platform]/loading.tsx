export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10 border-b w-full">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
          <div className="text-center mb-6">
            <div className="h-10 w-64 mx-auto bg-muted animate-pulse rounded-lg mb-2" />
            <div className="h-4 w-96 mx-auto bg-muted animate-pulse rounded" />
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-2xl h-12 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar Skeleton */}
        <aside className="hidden lg:block w-64 p-6 border-r">
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
                className="aspect-square bg-muted animate-pulse rounded-lg"
                style={{ animationDelay: `${i * 20}ms` }}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}


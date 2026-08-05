export default function Loading() {
  return (
    <div className="min-h-screen bg-transparent">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3 md:py-6 max-w-7xl">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="h-10 w-10 animate-pulse rounded-2xl bg-muted" />
              <div className="h-8 w-48 animate-pulse rounded-2xl bg-muted" />
            </div>
            <div className="h-10 w-24 animate-pulse rounded-2xl bg-muted" />
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="container mx-auto max-w-7xl px-4 py-6 md:py-12">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-10">
          {/* Left Column */}
          <div className="space-y-4 md:space-y-6">
            {/* Main Display */}
            <div className="clay-card p-6 md:p-12">
              <div className="clay-inset aspect-square animate-pulse" />
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-2 md:gap-4">
              <div className="h-12 animate-pulse rounded-2xl bg-muted" />
              <div className="h-12 animate-pulse rounded-2xl bg-muted" />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4 md:space-y-6">
            {/* Details Card */}
            <div className="clay-card-soft p-4 md:p-6">
              <div className="mb-6 h-8 w-32 animate-pulse rounded-2xl bg-muted" />
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <div className="mb-2 h-4 w-20 animate-pulse rounded-full bg-muted" />
                    <div className="h-6 w-full animate-pulse rounded-full bg-muted" />
                  </div>
                ))}
              </div>
            </div>

            {/* Keywords Card */}
            <div className="clay-card-soft p-4 md:p-6">
              <div className="mb-4 h-6 w-24 animate-pulse rounded-2xl bg-muted" />
              <div className="flex flex-wrap gap-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-muted" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

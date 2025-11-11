export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <header className="bg-card/30 backdrop-blur-lg border-b sticky top-0 z-40 shadow-sm w-full">
        <div className="container mx-auto px-4 py-3 md:py-6 max-w-7xl">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="w-10 h-10 bg-muted animate-pulse rounded-lg" />
              <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
            </div>
            <div className="w-24 h-10 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="container mx-auto px-4 py-6 md:py-12 max-w-5xl">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-12">
          {/* Left Column */}
          <div className="space-y-4 md:space-y-6">
            {/* Main Display */}
            <div className="bg-card rounded-xl md:rounded-2xl p-6 md:p-12 border-2 shadow-lg">
              <div className="aspect-square bg-muted animate-pulse rounded-lg" />
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-2 md:gap-4">
              <div className="h-12 bg-muted animate-pulse rounded-lg" />
              <div className="h-12 bg-muted animate-pulse rounded-lg" />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4 md:space-y-6">
            {/* Details Card */}
            <div className="bg-card rounded-lg md:rounded-xl p-4 md:p-6 border shadow-sm">
              <div className="h-8 w-32 bg-muted animate-pulse rounded-lg mb-6" />
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 w-20 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-6 w-full bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Keywords Card */}
            <div className="bg-card rounded-lg md:rounded-xl p-4 md:p-6 border shadow-sm">
              <div className="h-6 w-24 bg-muted animate-pulse rounded-lg mb-4" />
              <div className="flex flex-wrap gap-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-8 w-20 bg-muted animate-pulse rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


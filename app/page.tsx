'use client'

import { useState } from 'react'
import type { Campground, SearchParams } from '@/lib/campflare-types'
import { SearchForm } from '@/components/search-form'
import { ResultsGrid } from '@/components/results-grid'

export default function Home() {
  const [campgrounds, setCampgrounds] = useState<Campground[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [lastSearch, setLastSearch] = useState<SearchParams | null>(null)

  async function handleSearch(params: SearchParams) {
    setIsLoading(true)
    setError('')
    setHasSearched(false)
    setLastSearch(params)

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Search failed. Please try again.')
      }

      const data = await res.json()
      setCampgrounds(data.campgrounds ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
      setCampgrounds([])
    } finally {
      setIsLoading(false)
      setHasSearched(true)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 17h2l2-6 3 6 2-3 2 3h5" />
              <path d="M3 21h18" />
              <circle cx="12" cy="8" r="2" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground leading-none">
              RV Campsite Finder
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Full hookup waterfront sites
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
          {/* Search Panel */}
          <aside className="lg:sticky lg:top-6">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                Search
              </h2>
              <SearchForm onSearch={handleSearch} isLoading={isLoading} />
            </div>

            {/* Tips */}
            <div className="mt-4 rounded-xl border border-border bg-card p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Tips
              </h3>
              <ul className="space-y-1.5 text-xs text-muted-foreground leading-relaxed list-disc list-inside">
                <li>Search by city, state, national park, or campground name.</li>
                <li>Water-access sites are prioritized in results.</li>
                <li>
                  Click &quot;View Available Sites&quot; to see per-site availability for
                  your dates.
                </li>
                <li>Not all campgrounds have real-time availability data.</li>
              </ul>
            </div>
          </aside>

          {/* Results Panel */}
          <section aria-live="polite" aria-label="Search results">
            {!hasSearched && !isLoading && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div
                  className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4"
                  aria-hidden="true"
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
                <h2 className="text-base font-semibold text-foreground">
                  Find your perfect site
                </h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs leading-relaxed">
                  Enter your travel dates and location to discover available
                  full-hookup RV campsites near the water.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div
                  className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4"
                  role="status"
                  aria-label="Searching"
                />
                <p className="text-sm text-muted-foreground">
                  Searching campgrounds...
                </p>
              </div>
            )}

            {error && !isLoading && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            {hasSearched && !isLoading && !error && lastSearch && (
              <ResultsGrid
                campgrounds={campgrounds}
                searchParams={lastSearch}
                minPrice={lastSearch.minPrice}
                maxPrice={lastSearch.maxPrice}
              />
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

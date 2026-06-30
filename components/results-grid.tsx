'use client'

import { useState } from 'react'
import { SearchX, Map, LayoutGrid } from 'lucide-react'
import type { Campground, SearchParams } from '@/lib/campflare-types'
import { CampgroundCard } from './campground-card'
import { CampgroundMap } from './campground-map'

interface ResultsGridProps {
  campgrounds: Campground[]
  searchParams: SearchParams
  minPrice?: number
  maxPrice?: number
}

export function ResultsGrid({ campgrounds, searchParams, minPrice, maxPrice }: ResultsGridProps) {
  const [showMap, setShowMap] = useState(false)
  const [selectedId, setSelectedId] = useState<string | undefined>()

  // Client-side price filter
  let filtered = campgrounds
  if (minPrice !== undefined || maxPrice !== undefined) {
    filtered = campgrounds.filter((c) => {
      const price = c.price?.minimum
      if (price === undefined) return true
      if (minPrice !== undefined && price < minPrice) return false
      if (maxPrice !== undefined && price > maxPrice) return false
      return true
    })
  }

  const mappable = filtered.filter(
    (c) => c.location?.latitude != null && c.location?.longitude != null
  )

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <div className="flex justify-center mb-3" aria-hidden="true">
          <SearchX size={40} className="text-muted-foreground/50" />
        </div>
        <p className="text-base font-medium text-foreground">No campgrounds found</p>
        <p className="text-sm mt-1">
          Try adjusting your dates, location, or filters.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {filtered.length} campground{filtered.length !== 1 ? 's' : ''} found
          {searchParams.query ? ` near "${searchParams.query}"` : ''}
        </p>

        {mappable.length > 0 && (
          <button
            onClick={() => setShowMap((v) => !v)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              showMap
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-foreground hover:border-primary/50'
            }`}
            aria-pressed={showMap}
          >
            {showMap ? <LayoutGrid size={13} /> : <Map size={13} />}
            {showMap ? 'List View' : 'Map View'}
          </button>
        )}
      </div>

      {/* Map */}
      {showMap && mappable.length > 0 && (
        <div className="mb-5">
          <CampgroundMap
            campgrounds={filtered}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id)
              // Scroll the matching card into view
              document.getElementById(`campground-${id}`)?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
              })
            }}
          />
          {mappable.length < filtered.length && (
            <p className="text-xs text-muted-foreground mt-1.5">
              {filtered.length - mappable.length} campground{filtered.length - mappable.length !== 1 ? 's' : ''} without coordinates not shown on map.
            </p>
          )}
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((campground) => (
          <div
            key={campground.id}
            id={`campground-${campground.id}`}
            onClick={() => setSelectedId(campground.id)}
            className={`rounded-xl transition-shadow ${
              selectedId === campground.id && showMap
                ? 'ring-2 ring-primary ring-offset-2'
                : ''
            }`}
          >
            <CampgroundCard
              campground={campground}
              checkIn={searchParams.checkIn}
              checkOut={searchParams.checkOut}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

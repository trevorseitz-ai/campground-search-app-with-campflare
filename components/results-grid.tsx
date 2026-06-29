'use client'

import type { Campground, SearchParams } from '@/lib/campflare-types'
import { CampgroundCard } from './campground-card'

interface ResultsGridProps {
  campgrounds: Campground[]
  searchParams: SearchParams
  minPrice?: number
  maxPrice?: number
}

export function ResultsGrid({ campgrounds, searchParams, minPrice, maxPrice }: ResultsGridProps) {
  // Client-side price filter if the user set one
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

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <div className="text-4xl mb-3 select-none">&#127794;</div>
        <p className="text-base font-medium text-foreground">No campgrounds found</p>
        <p className="text-sm mt-1">
          Try adjusting your dates, location, or filters.
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        {filtered.length} campground{filtered.length !== 1 ? 's' : ''} found
        {searchParams.query ? ` near "${searchParams.query}"` : ''}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((campground) => (
          <CampgroundCard
            key={campground.id}
            campground={campground}
            checkIn={searchParams.checkIn}
            checkOut={searchParams.checkOut}
          />
        ))}
      </div>
    </div>
  )
}

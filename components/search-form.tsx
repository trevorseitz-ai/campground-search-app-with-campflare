'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Zap, Waves, PawPrint } from 'lucide-react'
import type { SearchParams } from '@/lib/campflare-types'

interface SearchFormProps {
  onSearch: (params: SearchParams) => void
  isLoading: boolean
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const tomorrow = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd')

  const [query, setQuery] = useState('')
  const [checkIn, setCheckIn] = useState(today)
  const [checkOut, setCheckOut] = useState(tomorrow)
  const [petFriendly, setPetFriendly] = useState(false)
  const [fullHookups, setFullHookups] = useState(true)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [radiusMiles, setRadiusMiles] = useState<number | ''>('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSearch({
      query,
      checkIn,
      checkOut,
      petFriendly,
      fullHookups,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      radiusMiles: radiusMiles !== '' ? Number(radiusMiles) : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Location / Name Search + Distance */}
      <div className="space-y-3">
        <div>
          <label htmlFor="query" className="block text-sm font-medium text-foreground mb-1.5">
            Location or Campground Name
          </label>
          <input
            id="query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Lake Tahoe, CA or Yosemite"
            className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="radius" className="block text-sm font-medium text-foreground mb-1.5">
            Distance from Location
          </label>
          <select
            id="radius"
            value={radiusMiles}
            onChange={(e) => setRadiusMiles(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Any distance</option>
            <option value="25">Within 25 miles</option>
            <option value="50">Within 50 miles</option>
            <option value="100">Within 100 miles</option>
            <option value="150">Within 150 miles</option>
            <option value="200">Within 200 miles</option>
          </select>
          {radiusMiles !== '' && !query && (
            <p className="mt-1 text-xs text-muted-foreground">
              Enter a location above to use distance filtering.
            </p>
          )}
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="checkIn" className="block text-sm font-medium text-foreground mb-1.5">
            Check-In
          </label>
          <input
            id="checkIn"
            type="date"
            value={checkIn}
            min={today}
            onChange={(e) => setCheckIn(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="checkOut" className="block text-sm font-medium text-foreground mb-1.5">
            Check-Out
          </label>
          <input
            id="checkOut"
            type="date"
            value={checkOut}
            min={checkIn || today}
            onChange={(e) => setCheckOut(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Price Range (per night)
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min"
              min="0"
              className="w-full rounded-lg border border-border bg-card pl-7 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <span className="text-muted-foreground text-sm">to</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max"
              min="0"
              className="w-full rounded-lg border border-border bg-card pl-7 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Filter Toggles */}
      <div className="space-y-2.5">
        <label className="block text-sm font-medium text-foreground">Filters</label>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="Full Hookups (W/E/S)"
            active={fullHookups}
            onClick={() => setFullHookups(!fullHookups)}
            icon={<Zap size={12} />}
          />
          <FilterChip
            label="Waterfront / Water Access"
            active={true}
            onClick={() => {}}
            locked
            icon={<Waves size={12} />}
          />
          <FilterChip
            label="Pets Allowed"
            active={petFriendly}
            onClick={() => setPetFriendly(!petFriendly)}
            icon={<PawPrint size={12} />}
          />
        </div>
        {fullHookups && (
          <p className="text-xs text-muted-foreground">
            Searching for sites with electric, water, and sewer hookups
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || (!query && (!checkIn || !checkOut))}
        className="w-full rounded-lg bg-primary text-primary-foreground font-semibold py-3 px-6 text-sm transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Searching...' : 'Search Campgrounds'}
      </button>
    </form>
  )
}

interface FilterChipProps {
  label: string
  active: boolean
  onClick: () => void
  locked?: boolean
  icon?: React.ReactNode
}

function FilterChip({ label, active, onClick, locked, icon }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-card text-foreground border-border hover:border-primary/50'
      } ${locked ? 'cursor-default opacity-90' : 'cursor-pointer'}`}
    >
      {icon && <span aria-hidden="true" className="shrink-0">{icon}</span>}
      {label}
      {locked && <span className="text-[10px] opacity-75 ml-1">(always on)</span>}
    </button>
  )
}

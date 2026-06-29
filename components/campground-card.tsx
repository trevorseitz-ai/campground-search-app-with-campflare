'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Campground, Campsite, CampsiteAvailability } from '@/lib/campflare-types'
import { CampsiteList } from './campsite-list'

interface CampgroundCardProps {
  campground: Campground
  checkIn: string
  checkOut: string
}

export function CampgroundCard({ campground, checkIn, checkOut }: CampgroundCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [campsites, setCampsites] = useState<Campsite[]>([])
  const [availability, setAvailability] = useState<CampsiteAvailability[]>([])
  const [detailError, setDetailError] = useState('')

  const photo = campground.photos?.[0]
  const address = campground.location?.address
  const locationStr = address
    ? [address.city, address.state_code].filter(Boolean).join(', ')
    : ''

  async function handleExpand() {
    if (expanded) {
      setExpanded(false)
      return
    }
    setExpanded(true)
    if (campsites.length > 0) return
    setLoadingDetail(true)
    setDetailError('')
    try {
      const res = await fetch(
        `/api/campground/${campground.id}/availability?start_date=${checkIn}&end_date=${checkOut}`
      )
      if (!res.ok) throw new Error('Failed to load availability')
      const data = await res.json()
      setCampsites(data.campsites ?? [])
      setAvailability(data.campsite_availability ?? [])
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : 'Failed to load details')
    } finally {
      setLoadingDetail(false)
    }
  }

  const amenities = campground.amenities
  const hasFullHookups = amenities?.electric_hookups && amenities?.water_hookups && amenities?.sewer_hookups

  return (
    <article className="rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Photo */}
      <div className="relative h-44 w-full bg-muted overflow-hidden">
        {photo?.medium_url ? (
          <Image
            src={photo.medium_url}
            alt={photo.name ?? campground.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No photo available
          </div>
        )}
        {campground.status === 'open' && (
          <span className="absolute top-3 right-3 rounded-full bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1">
            Open
          </span>
        )}
        {campground.status === 'closed' && (
          <span className="absolute top-3 right-3 rounded-full bg-destructive text-white text-xs font-semibold px-2.5 py-1">
            Closed
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-foreground text-base leading-snug">
              {campground.name}
            </h3>
            {locationStr && (
              <p className="text-sm text-muted-foreground mt-0.5">{locationStr}</p>
            )}
          </div>
          {campground.price?.minimum && (
            <div className="text-right shrink-0">
              <span className="text-primary font-semibold text-base">
                ${campground.price.minimum}
              </span>
              <span className="text-muted-foreground text-xs">/night</span>
            </div>
          )}
        </div>

        {/* Amenity Badges */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {hasFullHookups && <Badge label="Full Hookups" variant="primary" />}
          {amenities?.electric_hookups && !hasFullHookups && <Badge label="Electric" variant="secondary" />}
          {amenities?.water_hookups && !hasFullHookups && <Badge label="Water" variant="secondary" />}
          {amenities?.sewer_hookups && !hasFullHookups && <Badge label="Sewer" variant="secondary" />}
          {amenities?.pets_allowed && <Badge label="Pet Friendly" variant="secondary" />}
          {campground.big_rig_friendly && <Badge label="Big Rig OK" variant="secondary" />}
          {campground.has_pull_through_sites && <Badge label="Pull-Through" variant="secondary" />}
          {amenities?.dump_station && <Badge label="Dump Station" variant="secondary" />}
          {amenities?.showers && <Badge label="Showers" variant="secondary" />}
          {amenities?.wifi && <Badge label="WiFi" variant="secondary" />}
        </div>

        {campground.short_description && (
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed line-clamp-2">
            {campground.short_description}
          </p>
        )}

        {campground.max_rv_length && (
          <p className="text-xs text-muted-foreground mt-2">
            Max RV length: {campground.max_rv_length} ft
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={handleExpand}
            className="flex-1 rounded-lg border border-primary text-primary text-sm font-medium py-2 hover:bg-primary/5 transition-colors"
          >
            {expanded ? 'Hide Sites' : 'View Available Sites'}
          </button>
          {campground.reservation_url && (
            <a
              href={campground.reservation_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center rounded-lg bg-primary text-primary-foreground text-sm font-medium py-2 hover:opacity-90 transition-opacity"
            >
              Book Now
            </a>
          )}
        </div>

        {/* Expanded Campsites */}
        {expanded && (
          <div className="mt-4 border-t border-border pt-4">
            {loadingDetail && (
              <div className="text-sm text-muted-foreground text-center py-4">
                Loading available sites...
              </div>
            )}
            {detailError && (
              <div className="text-sm text-destructive text-center py-4">{detailError}</div>
            )}
            {!loadingDetail && !detailError && (
              <CampsiteList
                campsites={campsites}
                availability={availability}
                checkIn={checkIn}
                checkOut={checkOut}
              />
            )}
          </div>
        )}
      </div>
    </article>
  )
}

function Badge({ label, variant }: { label: string; variant: 'primary' | 'secondary' }) {
  return (
    <span
      className={`rounded-full text-xs font-medium px-2.5 py-0.5 ${
        variant === 'primary'
          ? 'bg-primary/10 text-primary border border-primary/20'
          : 'bg-muted text-muted-foreground border border-border'
      }`}
    >
      {label}
    </span>
  )
}

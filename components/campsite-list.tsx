'use client'

import type { Campsite, CampsiteAvailability } from '@/lib/campflare-types'

interface CampsiteListProps {
  campsites: Campsite[]
  availability: CampsiteAvailability[]
  checkIn: string
  checkOut: string
}

export function CampsiteList({ campsites, availability, checkIn, checkOut }: CampsiteListProps) {
  if (campsites.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-3">
        No campsite details available for this campground.
      </p>
    )
  }

  // Build availability map: campsite_id -> array of statuses for the date range
  const availMap = new Map<string, string[]>()
  for (const avail of availability) {
    const statuses: string[] = []
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0]
      statuses.push(avail.availability[key] ?? 'unknown')
    }
    availMap.set(avail.campsite_id, statuses)
  }

  function getAvailStatus(siteId: string): 'available' | 'partial' | 'unavailable' | 'unknown' {
    const statuses = availMap.get(siteId)
    if (!statuses || statuses.length === 0) return 'unknown'
    const available = statuses.filter(
      (s) => s === 'available' || s === 'first-come-first-serve'
    )
    if (available.length === statuses.length) return 'available'
    if (available.length > 0) return 'partial'
    return 'unavailable'
  }

  // Filter to RV sites with full hookups, waterfront preference
  const rvSites = campsites.filter(
    (s) => s.kind === 'rv' || s.kind === 'water-access' || s.electric_hookups || s.water_hookups
  )

  // Sort: available first, then partial, then unavailable
  const sorted = [...rvSites].sort((a, b) => {
    const order = { available: 0, partial: 1, unknown: 2, unavailable: 3 }
    return order[getAvailStatus(a.id)] - order[getAvailStatus(b.id)]
  })

  const displaySites = sorted.length > 0 ? sorted : campsites

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-foreground mb-3">
        Available Campsites ({displaySites.length})
      </h4>
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {displaySites.map((site) => {
          const status = getAvailStatus(site.id)
          const hasFullHookups = site.electric_hookups && site.water_hookups && site.sewer_hookups
          return (
            <div
              key={site.id}
              className="flex items-start justify-between rounded-lg border border-border p-3 gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground truncate">
                    {site.name}
                  </span>
                  {site.loop_name && (
                    <span className="text-xs text-muted-foreground">({site.loop_name})</span>
                  )}
                  <AvailabilityBadge status={status} />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {hasFullHookups && (
                    <span className="text-xs text-primary font-medium">Full Hookups</span>
                  )}
                  {!hasFullHookups && site.electric_hookups && (
                    <span className="text-xs text-muted-foreground">Electric</span>
                  )}
                  {!hasFullHookups && site.water_hookups && (
                    <span className="text-xs text-muted-foreground">Water</span>
                  )}
                  {site.pull_through && (
                    <span className="text-xs text-muted-foreground">Pull-Through</span>
                  )}
                  {site.max_rv_length && (
                    <span className="text-xs text-muted-foreground">
                      Max {site.max_rv_length}ft RV
                    </span>
                  )}
                  {site.ada_accessible && (
                    <span className="text-xs text-muted-foreground">ADA</span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                {site.price?.per_night && (
                  <div>
                    <span className="text-sm font-semibold text-foreground">
                      ${site.price.per_night}
                    </span>
                    <span className="text-xs text-muted-foreground">/night</span>
                  </div>
                )}
                {site.reservation_url && status !== 'unavailable' && (
                  <a
                    href={site.reservation_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-xs text-primary font-medium hover:underline"
                  >
                    Reserve
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AvailabilityBadge({ status }: { status: 'available' | 'partial' | 'unavailable' | 'unknown' }) {
  const styles = {
    available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    partial: 'bg-amber-50 text-amber-700 border-amber-200',
    unavailable: 'bg-red-50 text-red-600 border-red-200',
    unknown: 'bg-muted text-muted-foreground border-border',
  }
  const labels = {
    available: 'Available',
    partial: 'Partial',
    unavailable: 'Unavailable',
    unknown: 'Check Site',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

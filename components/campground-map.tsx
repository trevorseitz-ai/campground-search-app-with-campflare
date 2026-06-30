'use client'

import { useEffect, useRef } from 'react'
import type { Campground } from '@/lib/campflare-types'

interface CampgroundMapProps {
  campgrounds: Campground[]
  onSelect?: (id: string) => void
  selectedId?: string
}

// Leaflet is SSR-incompatible — imported dynamically at runtime only
export function CampgroundMap({ campgrounds, onSelect, selectedId }: CampgroundMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('leaflet').Map | null>(null)
  const markersRef = useRef<Map<string, import('leaflet').Marker>>(new Map())

  const withCoords = campgrounds.filter(
    (c) => c.location?.latitude != null && c.location?.longitude != null
  )

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Dynamically import leaflet so it never runs on the server
    import('leaflet').then((L) => {
      if (!containerRef.current || mapRef.current) return

      // Fix default marker icon paths broken by webpack
      // @ts-expect-error — leaflet internal
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(containerRef.current!, { zoomControl: true })
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map)

      if (withCoords.length === 0) {
        map.setView([39.5, -98.35], 4)
        return
      }

      const bounds: [number, number][] = []

      withCoords.forEach((cg) => {
        const lat = cg.location!.latitude!
        const lng = cg.location!.longitude!
        bounds.push([lat, lng])

        const marker = L.marker([lat, lng])
          .addTo(map)
          .bindPopup(
            `<div style="min-width:160px">
              <strong style="font-size:13px">${cg.name}</strong>
              ${cg.location?.address?.city ? `<div style="font-size:11px;color:#666;margin-top:2px">${cg.location.address.city}, ${cg.location.address.state_code ?? ''}</div>` : ''}
              ${cg.price?.per_night != null ? `<div style="font-size:12px;margin-top:4px;color:#2d6a4f;font-weight:600">$${cg.price.per_night}/night</div>` : ''}
            </div>`
          )

        marker.on('click', () => onSelect?.(cg.id))
        markersRef.current.set(cg.id, marker)
      })

      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 })
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      markersRef.current.clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When campgrounds list changes after initial mount, update markers
  useEffect(() => {
    if (!mapRef.current) return

    import('leaflet').then((L) => {
      const map = mapRef.current
      if (!map) return

      // Remove old markers
      markersRef.current.forEach((m) => m.remove())
      markersRef.current.clear()

      if (withCoords.length === 0) return

      const bounds: [number, number][] = []

      withCoords.forEach((cg) => {
        const lat = cg.location!.latitude!
        const lng = cg.location!.longitude!
        bounds.push([lat, lng])

        const isSelected = cg.id === selectedId

        const icon = isSelected
          ? L.divIcon({
              className: '',
              html: `<div style="width:14px;height:14px;border-radius:50%;background:#2d6a4f;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
              iconSize: [14, 14],
              iconAnchor: [7, 7],
            })
          : L.divIcon({
              className: '',
              html: `<div style="width:10px;height:10px;border-radius:50%;background:#52b788;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.3)"></div>`,
              iconSize: [10, 10],
              iconAnchor: [5, 5],
            })

        const marker = L.marker([lat, lng], { icon })
          .addTo(map)
          .bindPopup(
            `<div style="min-width:160px">
              <strong style="font-size:13px">${cg.name}</strong>
              ${cg.location?.address?.city ? `<div style="font-size:11px;color:#666;margin-top:2px">${cg.location.address.city}, ${cg.location.address.state_code ?? ''}</div>` : ''}
              ${cg.price?.per_night != null ? `<div style="font-size:12px;margin-top:4px;color:#2d6a4f;font-weight:600">$${cg.price.per_night}/night</div>` : ''}
            </div>`
          )

        marker.on('click', () => onSelect?.(cg.id))
        markersRef.current.set(cg.id, marker)
      })

      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campgrounds, selectedId])

  // Pan/open popup when selectedId changes
  useEffect(() => {
    if (!selectedId || !mapRef.current) return
    const marker = markersRef.current.get(selectedId)
    if (marker) {
      marker.openPopup()
      mapRef.current.setView(marker.getLatLng(), Math.max(mapRef.current.getZoom(), 10), {
        animate: true,
      })
    }
  }, [selectedId])

  if (withCoords.length === 0) return null

  return (
    <div
      ref={containerRef}
      className="w-full rounded-xl overflow-hidden border border-border"
      style={{ height: 360 }}
      aria-label="Map showing campground locations"
      role="img"
    />
  )
}

import { NextRequest, NextResponse } from 'next/server'

const CAMPFLARE_BASE = 'https://api.campflare.com/v2'

function getHeaders() {
  const key = process.env.CAMPFLARE_API_KEY
  return {
    'Authorization': key ?? '',
    'Content-Type': 'application/json',
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.CAMPFLARE_API_KEY) {
    return NextResponse.json(
      { error: 'CAMPFLARE_API_KEY is not configured. Add it in your Vercel project environment variables.' },
      { status: 500 }
    )
  }

  const { query, checkIn, checkOut, petFriendly, fullHookups, radiusMiles, waterfront } = await req.json()

  if (!query && !checkIn) {
    return NextResponse.json({ error: 'Please enter a location or campground name.' }, { status: 400 })
  }

  const amenities: string[] = []
  if (petFriendly) amenities.push('pets-allowed')
  if (fullHookups) {
    amenities.push('electric-hookups')
    amenities.push('water-hookups')
    amenities.push('sewer-hookups')
  }

  const campsite_kinds = ['rv']
  if (waterfront) {
    campsite_kinds.push('water-access')
  }

  // Build availability filter if dates are provided
  let availability: Record<string, unknown> | undefined = undefined
  if (checkIn && checkOut) {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const nights = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    availability = {
      date_ranges: [{ starting_date: checkIn, nights: Math.max(1, nights) }],
      // Include first-come-first-serve so waterfront/dispersed sites show up
      status: ['available', 'first-come-first-serve'],
      campsite_kinds,
    }
  }

  const body: Record<string, unknown> = {
    limit: 20,
    campsite_kinds,
  }

  if (amenities.length > 0) body.amenities = amenities
  if (availability) body.availability = availability

  // If a radius is provided, geocode the query and build a bbox.
  // When bbox is set we drop the text query from the body so Campflare
  // searches by geography only — mixing query + bbox returns nothing.
  let geocoded = false
  if (radiusMiles && typeof radiusMiles === 'number' && radiusMiles > 0 && query) {
    try {
      // Detect bare US zip codes and use Nominatim's postalcode param for accuracy
      const isZip = /^\d{5}(-\d{4})?$/.test(query.trim())
      const nominatimUrl = isZip
        ? `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(query.trim())}&countrycodes=us&format=json&limit=1`
        : `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=us&format=json&limit=1`

      const geo = await fetch(nominatimUrl, {
        headers: { 'User-Agent': 'rv-campsite-finder/1.0' },
      })
      const geoData = await geo.json()

      if (Array.isArray(geoData) && geoData.length > 0) {
        const lat = parseFloat(geoData[0].lat)
        const lon = parseFloat(geoData[0].lon)
        // 1 degree latitude ≈ 69 miles; 1 degree longitude ≈ 69 * cos(lat) miles
        const latDelta = radiusMiles / 69
        const lonDelta = radiusMiles / (69 * Math.cos((lat * Math.PI) / 180))
        body.bbox = {
          min_latitude: lat - latDelta,
          max_latitude: lat + latDelta,
          min_longitude: lon - lonDelta,
          max_longitude: lon + lonDelta,
        }
        geocoded = true
      }
    } catch {
      // Geocoding failed — fall through to text-only search
    }
  }

  // Only include text query when we did NOT successfully geocode.
  // Campflare treats query as a name search; combining it with bbox yields no results.
  if (query && !geocoded) body.query = query

  const searchRes = await fetch(`${CAMPFLARE_BASE}/campgrounds/search`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  })

  if (!searchRes.ok) {
    const err = await searchRes.text()
    return NextResponse.json({ error: err || 'Search failed' }, { status: searchRes.status })
  }

  const searchData = await searchRes.json()
  const campgrounds: unknown[] = searchData.campgrounds ?? []

  return NextResponse.json({ campgrounds })
}

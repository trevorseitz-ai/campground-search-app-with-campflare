import { NextRequest, NextResponse } from 'next/server'

const CAMPFLARE_BASE = 'https://api.campflare.com/v2'

function getHeaders() {
  const key = process.env.CAMPFLARE_API_KEY
  return {
    'Authorization': key ? `Bearer ${key}` : '',
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

  const { query, checkIn, checkOut, petFriendly, fullHookups } = await req.json()

  if (!query && !checkIn) {
    return NextResponse.json({ error: 'Please enter a location or campground name.' }, { status: 400 })
  }

  // Build amenities filter — note: Campflare API uses 'eletric-hookups' (their spelling)
  const amenities: string[] = []
  if (petFriendly) amenities.push('pets-allowed')
  if (fullHookups) {
    amenities.push('eletric-hookups')
    amenities.push('water-hookups')
    amenities.push('sewer-hookups')
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
      // Search for RV sites OR water-access sites
      campsite_kinds: ['rv', 'water-access'],
    }
  }

  const body: Record<string, unknown> = {
    limit: 20,
    // Top-level campsite_kinds covers both RV and water-access (treated as OR)
    campsite_kinds: ['rv', 'water-access'],
  }

  if (query) body.query = query
  if (amenities.length > 0) body.amenities = amenities
  if (availability) body.availability = availability

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

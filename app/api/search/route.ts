import { NextRequest, NextResponse } from 'next/server'

const CAMPFLARE_BASE = 'https://api.campflare.com/v2'

function getHeaders() {
  return {
    'Authorization': process.env.CAMPFLARE_API_KEY ?? '',
    'Content-Type': 'application/json',
  }
}

export async function POST(req: NextRequest) {
  const { query, checkIn, checkOut, petFriendly, fullHookups } = await req.json()

  if (!query && !checkIn) {
    return NextResponse.json({ error: 'At least a query or dates are required' }, { status: 400 })
  }

  // Build amenities filter
  const amenities: string[] = []
  if (petFriendly) amenities.push('pets-allowed')
  if (fullHookups) {
    amenities.push('eletric-hookups') // API uses this spelling
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
      status: ['available', 'first-come-first-serve'],
      campsite_kinds: ['rv'],
    }
  }

  const body: Record<string, unknown> = {
    limit: 20,
    campsite_kinds: ['rv'],
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

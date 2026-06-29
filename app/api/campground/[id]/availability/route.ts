import { NextRequest, NextResponse } from 'next/server'

const CAMPFLARE_BASE = 'https://api.campflare.com/v2'

function getHeaders() {
  return {
    'Authorization': process.env.CAMPFLARE_API_KEY ?? '',
    'Content-Type': 'application/json',
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(req.url)
  const startDate = searchParams.get('start_date')
  const endDate = searchParams.get('end_date')

  if (!startDate || !endDate) {
    return NextResponse.json({ error: 'start_date and end_date are required' }, { status: 400 })
  }

  // Fetch availability and campsites in parallel
  const [availRes, sitesRes] = await Promise.all([
    fetch(
      `${CAMPFLARE_BASE}/campground/${id}/availability?start_date=${startDate}&end_date=${endDate}`,
      { headers: getHeaders() }
    ),
    fetch(`${CAMPFLARE_BASE}/campground/${id}/campsites`, { headers: getHeaders() }),
  ])

  if (!availRes.ok) {
    const err = await availRes.text()
    return NextResponse.json({ error: err || 'Availability fetch failed' }, { status: availRes.status })
  }

  const availData = await availRes.json()
  const sitesData = sitesRes.ok ? await sitesRes.json() : []

  return NextResponse.json({
    campsite_availability: availData.campsite_availability ?? [],
    campsites: Array.isArray(sitesData) ? sitesData : [],
  })
}

export interface CampflareAddress {
  street1?: string
  street2?: string
  city?: string
  zipcode?: string
  country?: string
  country_code?: string
  state?: string
  state_code?: string
  full?: string
}

export interface CampflareLocation {
  latitude?: number
  longitude?: number
  elevation?: number
  address?: CampflareAddress
  directions?: string
}

export interface CampflarePhoto {
  original_url: string
  large_url?: string
  medium_url?: string
  small_url?: string
  attribution?: string
  attribution_needed: boolean
  name?: string
}

export interface CampflarePrice {
  minimum?: number
  maximum?: number
  per_night?: number
  currency_code: string
  currency: string
}

export interface CampflareAmenities {
  toilets?: boolean
  toilet_kind?: 'flush' | 'vault' | null
  trash?: boolean
  camp_store?: boolean
  dump_station?: boolean
  wifi?: boolean
  pets_allowed?: boolean
  showers?: boolean
  fires_allowed?: boolean
  water?: boolean
  electric_hookups?: boolean
  water_hookups?: boolean
  sewer_hookups?: boolean
}

export interface Campground {
  id: string
  name: string
  status?: 'open' | 'closed'
  status_description?: string
  kind?: 'established' | 'dispersed'
  short_description?: string
  medium_description?: string
  long_description?: string
  location?: CampflareLocation
  amenities?: CampflareAmenities
  max_rv_length?: number
  max_trailer_length?: number
  has_pull_through_sites?: boolean
  big_rig_friendly?: boolean
  reservation_url?: string
  photos?: CampflarePhoto[]
  price?: CampflarePrice
  default_campsite_schedule?: {
    check_in_time?: string
    check_out_time?: string
    uniform?: boolean
  }
}

export interface Campsite {
  id: string
  campground_id: string
  name: string
  loop_name?: string
  latitude?: number
  longitude?: number
  reservation_url?: string
  equipment?: Array<{ kind: 'rv' | 'tent' | 'trailer' | 'horse' | 'boat'; name: string }>
  kind: string
  kind_listed?: string
  price?: CampflarePrice
  firepit?: boolean
  picnic_table?: boolean
  ada_accessible?: boolean
  water_hookups?: boolean
  electric_hookups?: boolean
  sewer_hookups?: boolean
  max_people?: number
  max_cars?: number
  pull_through?: boolean
  driveway_length?: number
  max_rv_length?: number
  max_trailer_length?: number
  photos?: CampflarePhoto[]
}

export interface CampsiteAvailability {
  campsite_id: string
  availability: Record<string, 'available' | 'reserved' | 'closed' | 'first-come-first-serve' | 'not-yet-released' | 'unknown'>
}

export interface SearchParams {
  query: string
  checkIn: string
  checkOut: string
  petFriendly: boolean
  fullHookups: boolean
  waterfront: boolean
  minPrice?: number
  maxPrice?: number
  radiusMiles?: number
}

export interface SearchResult {
  campground: Campground
  availableSites: Campsite[]
  totalSites: number
}

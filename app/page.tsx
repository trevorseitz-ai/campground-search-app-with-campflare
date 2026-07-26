'use client';

import { useState, useEffect } from 'react';
import type { Campground, Campsite, CampsiteAvailability } from '@/lib/campflare-types';
import { CampsiteList } from '@/components/campsite-list';

interface CampgroundCardProps {
  camp: Campground;
  checkIn: string;
  checkOut: string;
}

const CampgroundCard: React.FC<CampgroundCardProps> = ({ camp, checkIn, checkOut }) => {
  const [expanded, setExpanded] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [campsites, setCampsites] = useState<Campsite[]>([]);
  const [availability, setAvailability] = useState<CampsiteAvailability[]>([]);
  const [detailError, setDetailError] = useState('');

  const amenities: string[] = [];
  if (camp.amenities?.electric_hookups && camp.amenities?.water_hookups && camp.amenities?.sewer_hookups) {
    amenities.push('Full Hookups');
  } else {
    if (camp.amenities?.electric_hookups) amenities.push('Electric');
    if (camp.amenities?.water_hookups) amenities.push('Water');
    if (camp.amenities?.sewer_hookups) amenities.push('Sewer');
  }
  if (camp.amenities?.pets_allowed) amenities.push('Pet Friendly');
  if (camp.big_rig_friendly) amenities.push('Big Rig OK');
  if (camp.has_pull_through_sites) amenities.push('Pull-Through');
  if (camp.amenities?.wifi) amenities.push('WiFi');

  async function handleExpand() {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (campsites.length > 0) return;
    setLoadingDetail(true);
    setDetailError('');
    try {
      const res = await fetch(
        `/api/campground/${camp.id}/availability?start_date=${checkIn}&end_date=${checkOut}`
      );
      if (!res.ok) throw new Error('Failed to load availability');
      const data = await res.json();
      setCampsites(data.campsites ?? []);
      setAvailability(data.campsite_availability ?? []);
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : 'Failed to load details');
    } finally {
      setLoadingDetail(false);
    }
  }

  const photo = camp.photos?.[0];
  const photoUrl = photo?.medium_url || photo?.original_url;

  return (
    <article style={{ border: '1px solid #e0e0e0', borderRadius: '8px', background: 'white', overflow: 'hidden' }}>
      <div style={{ 
        height: '160px', 
        background: photoUrl ? `url(${photoUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #4a90e2 0%, #2c5aa0 100%)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: '500' 
      }}>
        {!photoUrl && 'No Photo Available'}
      </div>
      <div style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '700', color: '#1a3a34', margin: '0', lineHeight: '1.3' }}>{camp.name}</h3>
            <p style={{ fontSize: '12px', color: '#6b8b84', margin: '0.25rem 0 0' }}>{camp.location?.address?.city}, {camp.location?.address?.state_code}</p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            {camp.price?.minimum ? (
              <>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '700', color: '#1b7f5e' }}>${camp.price.minimum}</span>
                <p style={{ fontSize: '11px', color: '#6b8b84', margin: '0' }}>per night</p>
              </>
            ) : null}
          </div>
        </div>
        {camp.short_description && <p style={{ fontSize: '12px', color: '#6b8b84', margin: '0.75rem 0', lineHeight: '1.5' }}>{camp.short_description}</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', margin: '0.75rem 0' }}>
          {amenities.map(a => <span key={a} style={{ display: 'inline-block', padding: '0.25rem 0.625rem', background: '#f0f4f1', border: '1px solid #d0d0d0', borderRadius: '4px', fontSize: '11px', fontWeight: '500', color: '#1a3a34' }}>{a}</span>)}
        </div>
        
        <button 
          onClick={handleExpand}
          style={{ width: '100%', padding: '0.625rem', marginTop: '0.75rem', background: '#1b7f5e', border: 'none', color: 'white', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
        >
          {expanded ? 'Hide Availability' : 'View Availability'}
        </button>

        {expanded && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e0e0e0' }}>
            {loadingDetail && <div style={{ fontSize: '12px', color: '#6b8b84', textAlign: 'center' }}>Loading available sites...</div>}
            {detailError && <div style={{ fontSize: '12px', color: '#c5192d', textAlign: 'center' }}>{detailError}</div>}
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
  );
};

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1504280327332-720d3f27f8d6?w=1400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=1400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1496080174650-637e3f22fa03?w=1400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1533873984035-25970ab07461?w=1400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=1400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=1400&h=600&fit=crop'
];

export default function RVCampsiteLanding() {
  const [query, setQuery] = useState('');
  const [checkIn, setCheckIn] = useState(getTodayDate());
  const [checkOut, setCheckOut] = useState(getTomorrowDate());
  const [radius, setRadius] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [campgrounds, setCampgrounds] = useState<Campground[]>([]);
  const [lastCheckIn, setLastCheckIn] = useState('');
  const [lastCheckOut, setLastCheckOut] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  function getTodayDate() {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }

  function getTomorrowDate() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() && !checkIn) {
      setError('Please enter a location.');
      return;
    }

    setIsLoading(true);
    setError('');
    setHasSearched(false);
    setLastCheckIn(checkIn);
    setLastCheckOut(checkOut);

    try {
      const payload = {
        query,
        checkIn,
        checkOut,
        petFriendly: true,
        fullHookups: true,
        waterfront: true,
        radiusMiles: radius ? Number(radius) : undefined,
      };

      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Search failed. Please try again.');
      }

      const data = await res.json();
      setCampgrounds(data.campgrounds ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setCampgrounds([]);
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  };

  const handleDetailsToggle = (e: React.SyntheticEvent) => {
    const details = e.currentTarget as HTMLDetailsElement;
    const span = details.querySelector('summary span');
    if (span) {
      span.textContent = details.open ? '−' : '+';
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; line-height: 1.6; background: #f7f8f6; color: #1a3a34; }
        h1, h2, h3 { font-family: 'Playfair Display', serif; }
        a { color: #1b7f5e; text-decoration: none; }
        a:hover { color: #0f5038; }
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      {/* Header */}
      <header style={{ background: 'white', padding: '1rem 2rem', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', background: '#1b7f5e', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '16px' }}>🏕</div>
            <h1 style={{ fontSize: '16px', fontWeight: '700', color: '#1a3a34', margin: '0' }}>RV Campsite Finder</h1>
          </div>
          <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <a href="#" style={{ fontSize: '13px', fontWeight: '500', color: '#1a3a34' }}>Search</a>
            <a href="#" style={{ fontSize: '13px', fontWeight: '500', color: '#1a3a34' }}>Benefits</a>
            <a href="#" style={{ fontSize: '13px', fontWeight: '500', color: '#1a3a34' }}>FAQ</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section style={{ position: 'relative', height: '550px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {HERO_IMAGES.map((src, index) => (
          <div 
            key={src}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url("${src}")`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              opacity: currentImageIndex === index ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              zIndex: 0
            }}
          />
        ))}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(26, 58, 52, 0.3)', zIndex: 1 }}></div>
        <h2 style={{ position: 'relative', zIndex: 2, fontSize: '56px', fontWeight: '700', color: 'white', margin: '0', lineHeight: '1.2', textAlign: 'center', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>Find Your Adventure</h2>
      </section>

      {/* Search Section */}
      <section style={{ background: 'white', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a3a34', margin: '0 0 2rem', textAlign: 'center' }}>Find Your Next Adventure</h2>
          <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1a3a34', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Location</label>
              <input type="text" placeholder="Lake Tahoe, CA or 94301" value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #d0d0d0', borderRadius: '4px', fontSize: '13px', color: '#1a3a34', background: 'white' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1a3a34', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Check-In</label>
              <input type="date" min={getTodayDate()} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #d0d0d0', borderRadius: '4px', fontSize: '13px', color: '#1a3a34', background: 'white' }} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1a3a34', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Check-Out</label>
              <input type="date" min={checkIn || getTodayDate()} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #d0d0d0', borderRadius: '4px', fontSize: '13px', color: '#1a3a34', background: 'white' }} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1a3a34', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Distance</label>
              <select value={radius} onChange={(e) => setRadius(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #d0d0d0', borderRadius: '4px', fontSize: '13px', color: '#1a3a34', background: 'white', cursor: 'pointer' }}>
                <option value="">Any distance</option>
                <option value="25">Within 25 miles</option>
                <option value="50">Within 50 miles</option>
                <option value="100">Within 100 miles</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={isLoading} style={{ padding: '0.75rem', background: '#1b7f5e', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', width: '100%', opacity: isLoading ? 0.7 : 1 }}>{isLoading ? 'Searching...' : 'Search'}</button>
            </div>
          </form>

          {!hasSearched && !isLoading && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ fontSize: '14px', color: '#6b8b84', margin: '0' }}>Enter your destination and dates to find available waterfront RV sites with full hookups.</p>
            </div>
          )}

          {error && (
            <div style={{ padding: '1rem', background: '#fef2f2', border: '1px solid #f5d4d4', borderRadius: '4px', color: '#c5192d', fontSize: '13px' }}>{error}</div>
          )}

          {hasSearched && !isLoading && !error && (
            <div>
              <p style={{ fontSize: '13px', color: '#6b8b84', marginBottom: '1.5rem' }}>{campgrounds.length} campground{campgrounds.length !== 1 ? 's' : ''} found</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {campgrounds.map(camp => (
                  <CampgroundCard key={camp.id} camp={camp} checkIn={lastCheckIn} checkOut={lastCheckOut} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
        <div style={{ background: '#ffc857', padding: '3rem', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#1a3a34', fontWeight: '600', margin: '0 0 1.5rem', lineHeight: '1.6' }}>Over 10,000 waterfront RV sites discovered by members in the past year.</p>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '64px', fontWeight: '700', color: '#1a3a34', margin: '0 0 0.5rem' }}>10k+</div>
          <p style={{ fontSize: '13px', color: '#1a3a34', margin: '0' }}>sites waiting for you</p>
        </div>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#1a3a34', margin: '0 0 1rem', lineHeight: '1.3' }}>Search for free. Save forever.</h2>
          <p style={{ fontSize: '14px', color: '#6b8b84', margin: '0 0 1.5rem', lineHeight: '1.7' }}>Browse full-hookup sites across the country with real-time availability. Save your favorites, track prices, and get alerts when your perfect spot opens up.</p>
          <button style={{ padding: '0.875rem 1.75rem', background: '#1b7f5e', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>Start Searching</button>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a3a34', margin: '0 0 3rem', textAlign: 'center' }}>Why Choose RV Campsite Finder</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
          {[
            { num: '1', title: 'Real-Time Availability', desc: 'See which waterfront sites are open right now. No guessing, no phone calls.' },
            { num: '2', title: 'Save Your Favorites', desc: 'Bookmark sites you love and get price drop alerts for your wishlist.' },
            { num: '3', title: 'Filter by Amenities', desc: 'Find full hookups, pull-through sites, pet-friendly spots, and more.' },
          ].map(item => (
            <div key={item.num} style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <div style={{ width: '48px', height: '48px', background: '#1b7f5e', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '20px', marginBottom: '1rem' }}>{item.num}</div>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1a3a34', margin: '0 0 0.75rem' }}>{item.title}</h3>
              <p style={{ fontSize: '13px', color: '#6b8b84', margin: '0', lineHeight: '1.6' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ background: 'white', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a3a34', margin: '0 0 3rem', textAlign: 'center' }}>Member Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { q: 'What makes a site "full hookup"?', a: 'Full hookups include electric, water, and sewer connections. Many of our featured sites also offer WiFi and cable TV. Check each site\'s amenities for details.' },
              { q: 'How far in advance can I book?', a: 'Availability varies by site. Some campgrounds open bookings 6-12 months in advance. Use our search to see available dates for your preferred location.' },
              { q: 'Do you offer group discounts?', a: 'Contact our group sales team for reservations of 5 or more sites. We can help coordinate caravan trips and group getaways.' },
              { q: 'Can I cancel or modify my booking?', a: 'Each campground has its own cancellation policy. Review the specific policy before booking. Most sites allow modifications up to 14 days before arrival.' },
            ].map((item, idx) => (
              <details key={idx} onToggle={handleDetailsToggle} style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: '1.5rem', cursor: 'pointer' }} defaultOpen={idx === 0}>
                <summary style={{ fontWeight: '700', color: '#1a3a34', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', listStyle: 'none' }}>
                  {item.q}
                  <span style={{ fontSize: '18px', fontWeight: '700', color: '#1b7f5e' }}>+</span>
                </summary>
                <p style={{ margin: '1rem 0 0', color: '#6b8b84', fontSize: '13px', lineHeight: '1.6' }}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ background: '#f0f4f1', padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a3a34', margin: '0 0 1rem' }}>Start Your Search Today</h2>
          <p style={{ fontSize: '14px', color: '#6b8b84', margin: '0 0 1.5rem', lineHeight: '1.6' }}>Join thousands of RVers finding their perfect waterfront camping spots.</p>
          <button style={{ padding: '0.875rem 2rem', background: '#1b7f5e', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>Search Now</button>
        </div>
      </section>
    </div>
  );
}

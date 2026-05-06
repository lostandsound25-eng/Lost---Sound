import Link from 'next/link';

export default function ItineraryDetail() {
  return (
    <main>
      <div className="container" style={{ padding: '200px 24px', textAlign: 'center' }}>
        <h1>Itinerary Coming Soon</h1>
        <p>We are currently updating our itinerary collection. Please check back later!</p>
        <Link href="/itineraries" style={{ color: 'var(--color-orange)', fontWeight: 700 }}>Back to Itineraries</Link>
      </div>
    </main>
  );
}

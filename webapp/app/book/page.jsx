'use client';
import { BookerEmbed } from "@calcom/atoms";

export default function BookPage() {
  return (
    <main style={{ padding: '120px 0 80px', backgroundColor: '#fff' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <div className="text-center mb-5">
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Book Your Discovery Call</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
            Pick a time that works for you and let's start planning your next adventure.
          </p>
        </div>

        <div style={{ 
          backgroundColor: '#F9F6ED', 
          borderRadius: '40px', 
          padding: '20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
          minHeight: '600px',
          overflow: 'hidden'
        }}>
          <BookerEmbed
            eventSlug="15min"
            username="lostandsound.jpg"
            view="month_view"
            customClassNames={{
              bookerContainer: "border-none",
            }}
          />
        </div>

        <div className="text-center mt-5">
          <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>
            Powered by Cal.com & Lost & Sound
          </p>
        </div>
      </div>
    </main>
  );
}

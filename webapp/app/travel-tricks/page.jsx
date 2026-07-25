import TravelTricksClient from './TravelTricksClient';

export const metadata = {
  title: 'Travel Tricks & Gear Blueprint | Lost & Sound',
  description: 'Our tested packing matrix, lightweight gear stack, flight booking secrets, and burnout prevention rituals for full-time travel.',
  openGraph: {
    title: 'Travel Tricks & Gear Blueprint | Lost & Sound',
    description: 'Our tested packing matrix, lightweight gear stack, flight booking secrets, and burnout prevention rituals.',
    url: 'https://lostandsound.com/travel-tricks',
    siteName: 'Lost & Sound',
    type: 'website',
  },
};

export default function TravelTricksPage() {
  return <TravelTricksClient />;
}

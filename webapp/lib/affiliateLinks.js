/**
 * Lost & Sound Centralized Affiliate Links Repository
 * 
 * Update your affiliate tags and referral codes here.
 * All links across the site will automatically update!
 */

export const AFFILIATE_CONFIG = {
  // Global Amazon Associate Tag (Appended automatically if present)
  amazonAssociateTag: 'lostandsound-20', // Replace with your actual Amazon Associate tag if different
};

export const AFFILIATE_LINKS = {
  // Services & Platforms
  chase_travel: 'https://www.chase.com/personal/credit-cards/travel',
  booking: 'https://www.booking.com/index.html?aid=800000', // Update with your Booking.com AID
  agoda: 'https://www.agoda.com',
  hostelworld: 'https://www.hostelworld.com',
  airbnb: 'https://www.airbnb.com',
  twelve_go: 'https://12go.asia',
  wise: 'https://wise.com',
  revolut: 'https://www.revolut.com',

  // Our Gear List
  dji_drone: 'https://www.amazon.com/dp/B0CVP35KWD?tag=lostandsound-20',
  jbl_speaker: 'https://www.amazon.com/s?k=JBL+GO4+speaker&tag=lostandsound-20',
  resistance_bands: 'https://www.amazon.com/s?k=travel+resistance+bands&tag=lostandsound-20',
  osprey_70l: 'https://www.amazon.com/s?k=Osprey+70L+backpack&tag=lostandsound-20',
  osprey_55l: 'https://www.amazon.com/s?k=Osprey+55L+backpack&tag=lostandsound-20',
  carabiners: 'https://www.amazon.com/s?k=heavy+duty+carabiners+travel&tag=lostandsound-20',
  yoga_mat: 'https://www.amazon.com/s?k=travel+yoga+mat+foldable&tag=lostandsound-20',
  packing_cubes: 'https://www.amazon.com/s?k=compression+packing+cubes&tag=lostandsound-20',
  beach_blanket: 'https://www.amazon.com/s?k=Ticket+to+the+Moon+beach+blanket&tag=lostandsound-20',
  microfiber_towel: 'https://www.amazon.com/s?k=quick+dry+microfiber+travel+towel&tag=lostandsound-20',
  salomon_runners: 'https://www.amazon.com/s?k=Salomon+trail+running+shoes&tag=lostandsound-20',
  ultra_runners: 'https://www.amazon.com/s?k=Altra+ultra+running+shoes&tag=lostandsound-20',
  sweater: 'https://www.amazon.com/s?k=travel+packable+sweater+hoodie&tag=lostandsound-20',
  universal_adapter: 'https://www.amazon.com/s?k=universal+travel+adapter+all+in+one&tag=lostandsound-20',
  wired_headphones: 'https://www.amazon.com/s?k=wired+earbuds+3.5mm+airplane&tag=lostandsound-20',
  sleeping_mask: 'https://www.amazon.com/s?k=3d+contour+sleep+mask&tag=lostandsound-20',
  tech_organizer: 'https://www.amazon.com/s?k=side+by+side+electronic+organizer+pouch&tag=lostandsound-20',
  kindle: 'https://www.amazon.com/s?k=Amazon+Kindle+Paperwhite&tag=lostandsound-20',
  kindle_case: 'https://www.amazon.com/s?k=Kindle+Paperwhite+case&tag=lostandsound-20',
  temple_sarong: 'https://www.amazon.com/s?k=lightweight+travel+sarong&tag=lostandsound-20',
  headlamp: 'https://www.amazon.com/s?k=rechargeable+headlamp+travel&tag=lostandsound-20',
  osmo_pocket_3: 'https://www.amazon.com/s?k=DJI+Osmo+Pocket+3&tag=lostandsound-20',
  olympus_camera: 'https://www.amazon.com/s?k=Olympus+OM-D+camera+street+photography&tag=lostandsound-20',
  liquid_bandage: 'https://www.amazon.com/s?k=liquid+bandage+spray&tag=lostandsound-20',
  airtags: 'https://www.amazon.com/s?k=Apple+AirTag+4+pack&tag=lostandsound-20',
};

/**
 * Utility function to retrieve an affiliate link safely
 */
export function getAffiliateLink(key, fallbackUrl = '#') {
  return AFFILIATE_LINKS[key] || fallbackUrl;
}

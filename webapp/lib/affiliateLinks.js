/**
 * Lost & Sound Centralized Affiliate Links Repository
 * 
 * Update your affiliate tags and referral codes here.
 * All links across the site will automatically update!
 */

export const AFFILIATE_CONFIG = {
  // Global Amazon Associate Tag (Appended automatically if present)
  amazonAssociateTag: 'lostandsoundt-20',
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
  dji_drone: 'https://www.amazon.com/dp/B0CVP35KWD?tag=lostandsoundt-20',
  jbl_speaker: 'https://www.amazon.com/s?k=JBL+GO4+speaker&tag=lostandsoundt-20',
  resistance_bands: 'https://www.amazon.com/s?k=travel+resistance+bands&tag=lostandsoundt-20',
  osprey_70l: 'https://amzn.to/4fPjpAO',
  osprey_55l: 'https://www.amazon.com/Osprey-Farpoint-Travel-Backpack-Tunnel/dp/B09ZNP86PQ?linkCode=ll2&tag=lostandsoundt-20&linkId=47d644c4d1e5053bb803851a7a575b3a&language=en_US&ref_=as_li_ss_tl',
  carabiners: 'https://www.amazon.com/s?k=heavy+duty+carabiners+travel&tag=lostandsoundt-20',
  yoga_mat: 'https://www.amazon.com/s?k=travel+yoga+mat+foldable&tag=lostandsoundt-20',
  packing_cubes: 'https://www.amazon.com/s?k=compression+packing+cubes&tag=lostandsoundt-20',
  beach_blanket: 'https://www.amazon.com/s?k=Ticket+to+the+Moon+beach+blanket&tag=lostandsoundt-20',
  microfiber_towel: 'https://www.amazon.com/s?k=quick+dry+microfiber+travel+towel&tag=lostandsoundt-20',
  salomon_runners: 'https://www.amazon.com/s?k=Salomon+trail+running+shoes&tag=lostandsoundt-20',
  ultra_runners: 'https://www.amazon.com/s?k=Altra+ultra+running+shoes&tag=lostandsoundt-20',
  sweater: 'https://www.amazon.com/s?k=travel+packable+sweater+hoodie&tag=lostandsoundt-20',
  universal_adapter: 'https://www.amazon.com/s?k=universal+travel+adapter+all+in+one&tag=lostandsoundt-20',
  wired_headphones: 'https://www.amazon.com/s?k=wired+earbuds+3.5mm+airplane&tag=lostandsoundt-20',
  sleeping_mask: 'https://www.amazon.com/s?k=3d+contour+sleep+mask&tag=lostandsoundt-20',
  tech_organizer: 'https://www.amazon.com/s?k=side+by+side+electronic+organizer+pouch&tag=lostandsoundt-20',
  kindle: 'https://www.amazon.com/s?k=Amazon+Kindle+Paperwhite&tag=lostandsoundt-20',
  kindle_case: 'https://www.amazon.com/s?k=Kindle+Paperwhite+case&tag=lostandsoundt-20',
  temple_sarong: 'https://www.amazon.com/s?k=lightweight+travel+sarong&tag=lostandsoundt-20',
  headlamp: 'https://www.amazon.com/s?k=rechargeable+headlamp+travel&tag=lostandsoundt-20',
  osmo_pocket_3: 'https://www.amazon.com/s?k=DJI+Osmo+Pocket+3&tag=lostandsoundt-20',
  olympus_camera: 'https://www.amazon.com/s?k=Olympus+OM-D+camera+street+photography&tag=lostandsoundt-20',
  liquid_bandage: 'https://www.amazon.com/s?k=liquid+bandage+spray&tag=lostandsoundt-20',
  airtags: 'https://www.amazon.com/s?k=Apple+AirTag+4+pack&tag=lostandsoundt-20',
};

/**
 * Utility function to retrieve an affiliate link safely
 */
export function getAffiliateLink(key, fallbackUrl = '#') {
  return AFFILIATE_LINKS[key] || fallbackUrl;
}

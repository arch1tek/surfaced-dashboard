export interface Venue {
  id: string;
  name: string;
  rating: number;
  user_ratings_total: number;
  price_level?: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: string;
  types: string[];
  business_status: string;
  photo_reference?: string;
  opening_hours?: {
    open_now: boolean;
  };
  locality?: string; // Which area/locality this venue belongs to
}

export interface LocationData {
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  description?: string;
  category?: string;
  tagline?: string;
}

export interface GeminiLocationResponse {
  locations: LocationData[];
  query_type: string;
  search_terms: string[];
}

export interface VenueSearchResult {
  location: string;
  venues: Venue[];
}

export enum VenueType {
  BAR = 'bar',
  PUB = 'night_club',
  RESTAURANT = 'restaurant',
  CAFE = 'cafe',
  CLUB = 'night_club'
}

export const getPriceText = (priceLevel?: number): string => {
  switch (priceLevel) {
    case 1: return '$';
    case 2: return '$$';
    case 3: return '$$$';
    case 4: return '$$$$';
    default: return 'Price not available';
  }
};

export const getVenueTypeColor = (types: string[]): string => {
  if (types.includes('night_club')) return 'bg-purple-500';
  if (types.includes('bar')) return 'bg-blue-500';
  if (types.includes('restaurant')) return 'bg-green-500';
  if (types.includes('cafe')) return 'bg-orange-500';
  return 'bg-gray-500';
}; 
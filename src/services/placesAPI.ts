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
}

export class PlacesService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchVenues(
    location: { latitude: number; longitude: number },
    searchTerms: string[],
    radius: number = 3000,
    limit: number = 6
  ): Promise<Venue[]> {
    // Use Google Maps JavaScript API Places Service instead of REST API
    // This requires the map to be loaded first
    return new Promise((resolve, reject) => {
      console.log(`🔍 Searching venues near ${location.latitude}, ${location.longitude} for terms: ${searchTerms.join(', ')}`);
      
      if (!window.google || !window.google.maps) {
        console.error('❌ Google Maps not loaded');
        reject(new Error('Google Maps not loaded'));
        return;
      }

      const map = new google.maps.Map(document.createElement('div'));
      const service = new google.maps.places.PlacesService(map);
      
      // Try multiple search strategies
      const searchStrategies = [
        // Strategy 1: Use keyword search with specific terms
        {
          location: new google.maps.LatLng(location.latitude, location.longitude),
          radius: radius,
          keyword: searchTerms.join(' '),
          type: 'establishment' as google.maps.places.PlaceType
        },
        // Strategy 2: Search specifically for bars and restaurants
        {
          location: new google.maps.LatLng(location.latitude, location.longitude),
          radius: radius,
          type: 'bar' as google.maps.places.PlaceType
        }
      ];

      const trySearch = (strategyIndex: number = 0): void => {
        if (strategyIndex >= searchStrategies.length) {
          console.log('🔍 All search strategies exhausted, returning empty results');
          resolve([]);
          return;
        }

        const request = searchStrategies[strategyIndex];
        console.log(`🔍 Trying search strategy ${strategyIndex + 1}:`, request);

        service.nearbySearch(request, (results, status) => {
          console.log(`📍 Search strategy ${strategyIndex + 1} status:`, status);
          console.log(`📍 Raw results count:`, results?.length || 0);
          
          if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
            console.log('✅ Places search successful, processing results...');
            
            const allResults = results.map(place => ({
              name: place.name,
              types: place.types,
              rating: place.rating,
              user_ratings_total: place.user_ratings_total
            }));
            console.log('📊 All results:', allResults);
            
            const venues: Venue[] = results
              .filter(place => {
                // Filter for relevant venue types
                const types = place.types || [];
                const isRelevant = types.some(type => 
                  ['bar', 'night_club', 'restaurant', 'cafe', 'meal_takeaway', 'food', 'establishment', 'point_of_interest'].includes(type)
                );
                console.log(`🏪 ${place.name}: types=${types.join(',')}, relevant=${isRelevant}`);
                return isRelevant;
              })
              .slice(0, limit)
              .map((place: any) => ({
                id: place.place_id || '',
                name: place.name || '',
                rating: place.rating || 0,
                user_ratings_total: place.user_ratings_total || 0,
                price_level: place.price_level,
                coordinates: {
                  latitude: place.geometry?.location?.lat() || 0,
                  longitude: place.geometry?.location?.lng() || 0
                },
                address: place.vicinity || '',
                types: place.types || [],
                business_status: place.business_status || 'OPERATIONAL',
                photo_reference: place.photos?.[0]?.getUrl ? place.photos[0].getUrl({ maxWidth: 400 }) : undefined,
                opening_hours: place.opening_hours ? {
                  open_now: place.opening_hours.open_now || false
                } : undefined
              }))
              .sort((a, b) => {
                // Sort by rating and number of reviews
                const scoreA = a.rating * Math.log(a.user_ratings_total + 1);
                const scoreB = b.rating * Math.log(b.user_ratings_total + 1);
                return scoreB - scoreA;
              });

            console.log(`✅ Filtered venues count: ${venues.length}`);
            venues.forEach(venue => console.log(`🏪 Found: ${venue.name} (${venue.types.join(', ')})`));
            
            if (venues.length > 0) {
              resolve(venues);
            } else {
              console.log('⚠️ No relevant venues found, trying next strategy...');
              trySearch(strategyIndex + 1);
            }
          } else {
            console.log(`❌ Search strategy ${strategyIndex + 1} failed:`, status);
            if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              console.log('📍 Zero results for this strategy, trying next...');
            } else if (status === google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
              console.error('🚫 Google Places API quota exceeded');
              reject(new Error('Google Places API quota exceeded. Please check your usage limits.'));
              return;
            } else if (status === google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
              console.error('🚫 Google Places API request denied');
              reject(new Error('Google Places API request denied. Please check your API key permissions.'));
              return;
            }
            trySearch(strategyIndex + 1);
          }
        });
      };

      trySearch();
    });
  }

     async searchVenuesInMultipleLocations(
     locations: { name: string; coordinates: { latitude: number; longitude: number } }[],
     searchTerms: string[],
     venuesPerLocation: number = 4
   ): Promise<{ location: string; venues: Venue[] }[]> {
    const results = await Promise.all(
      locations.map(async (location) => {
        try {
          const venues = await this.searchVenues(
            location.coordinates,
            searchTerms,
            3000,
            venuesPerLocation
          );
          return {
            location: location.name,
            venues
          };
        } catch (error) {
          console.error(`Error searching venues in ${location.name}:`, error);
          return {
            location: location.name,
            venues: []
          };
        }
      })
    );

    return results;
  }

  getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
    return `https://maps.googleapis.com/maps/api/place/photo?` +
      `maxwidth=${maxWidth}` +
      `&photo_reference=${photoReference}` +
      `&key=${this.apiKey}`;
  }
} 
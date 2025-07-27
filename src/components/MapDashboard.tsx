import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { database } from '@/lib/firebase';
import { ref, onValue, off } from 'firebase/database';
import MapPin from './MapPin';
import SearchInput from './SearchInput';
import ApiKeyInput from './ApiKeyInput';
import { Loader2, ChevronDown, ChevronUp, Star, Clock, DollarSign } from 'lucide-react';
import { 
  UrbanReport, 
  SourceType, 
  ReportType, 
  Priority, 
  VerificationStatus,
  getPriorityColor,
  getReportTypeColor,
  getTopicCategory
} from '@/types/urbanReport';
import { GeminiService, GeminiLocationResponse } from '@/services/geminiAPI';
import { PlacesService } from '@/services/placesAPI';
import { Venue, VenueSearchResult, getPriceText, getVenueTypeColor } from '@/types/venue';

// Bengaluru coordinates
const BENGALURU_CENTER: [number, number] = [77.5946, 12.9716];



// Demo data using UrbanReport structure
const DEMO_DATA: UrbanReport[] = [
  {
    id: '1',
    request: {
      id: '1',
      source_type: SourceType.AUTHORITY,
      source_id: 'traffic_dept_blr',
      text: 'Heavy traffic reported on MG Road due to construction work',
      reported_from_location: { latitude: 12.9716, longitude: 77.5946 },
      reported_at_timestamp: new Date(Date.now() - 300000)
    },
    report_metadata: {
      source_type: SourceType.AUTHORITY,
      report_type: ReportType.CURRENT_EVENT,
      report_priority: Priority.HIGH,
      report_topics: ['traffic', 'infrastructure'],
      reported_at_timestamp: new Date(Date.now() - 300000),
      reported_from_location: { latitude: 12.9716, longitude: 77.5946 }
    },
    holistic_summary: {
      id: '1',
      title: 'Heavy Traffic - MG Road',
      details: 'Traffic jam on MG Road due to ongoing construction work. Expect delays of 15-20 minutes.',
      locations: [{ latitude: 12.9716, longitude: 77.5946 }],
      location_names: ['MG Road', 'Brigade Road Junction'],
      files: [],
      topics: ['traffic', 'infrastructure'],
      report_type: ReportType.CURRENT_EVENT,
      report_priority: Priority.HIGH,
      start_timestamp: new Date(Date.now() - 300000),
      end_timestamp: new Date(Date.now() + 3600000)
    }
  },
  {
    id: '2',
    request: {
      id: '2',
      source_type: SourceType.BUSINESS,
      source_id: 'palace_grounds_events',
      text: 'Bengaluru Literature Festival ongoing at Palace Grounds',
      reported_from_location: { latitude: 12.9352, longitude: 77.6245 },
      reported_at_timestamp: new Date(Date.now() - 1800000)
    },
    report_metadata: {
      source_type: SourceType.BUSINESS,
      report_type: ReportType.CURRENT_EVENT,
      report_priority: Priority.MEDIUM,
      report_topics: ['event', 'gathering', 'entertainment'],
      reported_at_timestamp: new Date(Date.now() - 1800000),
      reported_from_location: { latitude: 12.9352, longitude: 77.6245 }
    },
    holistic_summary: {
      id: '2',
      title: 'Bengaluru Literature Festival',
      details: 'Annual literature festival featuring renowned authors, book readings, and cultural performances.',
      locations: [{ latitude: 12.9352, longitude: 77.6245 }],
      location_names: ['Palace Grounds'],
      files: [],
      topics: ['event', 'gathering', 'entertainment'],
      report_type: ReportType.CURRENT_EVENT,
      report_priority: Priority.MEDIUM,
      start_timestamp: new Date(Date.now() - 1800000),
      end_timestamp: new Date(Date.now() + 7200000)
    }
  },
  {
    id: '3',
    request: {
      id: '3',
      source_type: SourceType.AUTHORITY,
      source_id: 'bbmp_works',
      text: 'Temporary road closure on Whitefield Road for emergency repairs',
      reported_from_location: { latitude: 12.9579, longitude: 77.6411 },
      reported_at_timestamp: new Date(Date.now() - 3600000)
    },
    report_metadata: {
      source_type: SourceType.AUTHORITY,
      report_type: ReportType.CURRENT_EVENT,
      report_priority: Priority.MEDIUM,
      report_topics: ['safety', 'infrastructure', 'road_closure'],
      reported_at_timestamp: new Date(Date.now() - 3600000),
      reported_from_location: { latitude: 12.9579, longitude: 77.6411 }
    },
    holistic_summary: {
      id: '3',
      title: 'Road Closure - Whitefield Road',
      details: 'Temporary road closure on Whitefield Road for emergency water pipe repairs. Alternative routes available.',
      locations: [{ latitude: 12.9579, longitude: 77.6411 }],
      location_names: ['Whitefield Road', 'ITPL Main Road'],
      files: [],
      topics: ['safety', 'infrastructure', 'road_closure'],
      report_type: ReportType.CURRENT_EVENT,
      report_priority: Priority.MEDIUM,
      start_timestamp: new Date(Date.now() - 3600000),
      end_timestamp: new Date(Date.now() + 10800000)
    }
  },
  {
    id: '4',
    request: {
      id: '4',
      source_type: SourceType.AUTHORITY,
      source_id: 'bmrcl_ops',
      text: 'Purple line metro experiencing delays due to technical issues',
      reported_from_location: { latitude: 12.9780, longitude: 77.5909 },
      reported_at_timestamp: new Date(Date.now() - 900000)
    },
    report_metadata: {
      source_type: SourceType.AUTHORITY,
      report_type: ReportType.CURRENT_EVENT,
      report_priority: Priority.MEDIUM,
      report_topics: ['metro', 'transport'],
      reported_at_timestamp: new Date(Date.now() - 900000),
      reported_from_location: { latitude: 12.9780, longitude: 77.5909 }
    },
    holistic_summary: {
      id: '4',
      title: 'Metro Delay - Purple Line',
      details: 'Purple line experiencing 10-minute delays due to technical issues at Cubbon Park station.',
      locations: [{ latitude: 12.9780, longitude: 77.5909 }],
      location_names: ['Cubbon Park Metro Station', 'Purple Line'],
      files: [],
      topics: ['metro', 'transport'],
      report_type: ReportType.CURRENT_EVENT,
      report_priority: Priority.MEDIUM,
      start_timestamp: new Date(Date.now() - 900000),
      end_timestamp: new Date(Date.now() + 1800000)
    }
  },
  {
    id: '5',
    request: {
      id: '5',
      source_type: SourceType.AUTHORITY,
      source_id: 'bescom_ops',
      text: 'Scheduled power maintenance in HSR Layout area',
      reported_from_location: { latitude: 12.9266, longitude: 77.6277 },
      reported_at_timestamp: new Date(Date.now() - 2700000)
    },
    report_metadata: {
      source_type: SourceType.AUTHORITY,
      report_type: ReportType.CURRENT_EVENT,
      report_priority: Priority.LOW,
      report_topics: ['power', 'maintenance'],
      reported_at_timestamp: new Date(Date.now() - 2700000),
      reported_from_location: { latitude: 12.9266, longitude: 77.6277 }
    },
    holistic_summary: {
      id: '5',
      title: 'Power Maintenance - HSR Layout',
      details: 'Scheduled maintenance affecting HSR Layout area. Power will be restored by 6 PM.',
      locations: [{ latitude: 12.9266, longitude: 77.6277 }],
      location_names: ['HSR Layout', 'Sector 1', 'Sector 2'],
      files: [],
      topics: ['power', 'maintenance'],
      report_type: ReportType.CURRENT_EVENT,
      report_priority: Priority.LOW,
      start_timestamp: new Date(Date.now() - 2700000),
      end_timestamp: new Date(Date.now() + 5400000)
    }
  }
];

const MapDashboard = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const venueMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [mapData, setMapData] = useState<UrbanReport[]>(DEMO_DATA);
  const [venues, setVenues] = useState<VenueSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingSearch, setIsProcessingSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastGeminiResponse, setLastGeminiResponse] = useState<GeminiLocationResponse | null>(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string | null>(null);
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);
  const [geminiService, setGeminiService] = useState<GeminiService | null>(null);
  const [placesService, setPlacesService] = useState<PlacesService | null>(null);
  const [isEventsExpanded, setIsEventsExpanded] = useState(true);
  const [isVenuesExpanded, setIsVenuesExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'events' | 'venues'>('events');
  const [selectedLocality, setSelectedLocality] = useState<string | null>(null);

  // Check for existing API keys on component mount
  useEffect(() => {
    const savedGoogleMapsApiKey = localStorage.getItem('googleMapsApiKey');
    const savedGeminiApiKey = localStorage.getItem('geminiApiKey');
    
    if (savedGoogleMapsApiKey && savedGeminiApiKey) {
      setGoogleMapsApiKey(savedGoogleMapsApiKey);
      setGeminiApiKey(savedGeminiApiKey);
      setGeminiService(new GeminiService(savedGeminiApiKey));
      setPlacesService(new PlacesService(savedGoogleMapsApiKey));
    } else {
      setIsLoading(false);
    }
  }, []);

  // Initialize Google Maps
  useEffect(() => {
    if (!googleMapsApiKey || !mapContainer.current) return;

    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: googleMapsApiKey,
          version: 'weekly',
          libraries: ['places', 'marker']
        });

        const { Map } = await loader.importLibrary('maps');
        const { AdvancedMarkerElement } = await loader.importLibrary('marker');
        const { PlacesService } = await loader.importLibrary('places');

        // Initialize map
        map.current = new Map(mapContainer.current!, {
          center: { lat: BENGALURU_CENTER[1], lng: BENGALURU_CENTER[0] },
          zoom: 11,
          mapId: 'bengaluru-dashboard', // Required for advanced markers
          tilt: 45,
          heading: 0
        });

        // Clear existing markers
        markersRef.current.forEach(marker => {
          if (marker.map) {
            marker.map = null;
          }
        });
        markersRef.current = [];

        // Clear existing venue markers
        venueMarkersRef.current.forEach(marker => {
          if (marker.map) {
            marker.map = null;
          }
        });
        venueMarkersRef.current = [];

                 // Add markers for map data (only show if activeTab is 'events')
         if (activeTab === 'events') {
           mapData.forEach((report) => {
             if (map.current && report.holistic_summary.locations.length > 0) {
               const location = report.holistic_summary.locations[0];
               const priorityColor = getPriorityColor(report.holistic_summary.report_priority);
               
               // Create custom marker element with priority-based color
               const markerElement = document.createElement('div');
               markerElement.innerHTML = `
                 <div class="relative w-12 h-12 rounded-full border-3 border-white shadow-floating cursor-pointer transition-all duration-300 ${priorityColor} flex items-center justify-center hover:scale-110">
                   <div class="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                     <div class="w-3 h-3 ${priorityColor} rounded-full"></div>
                   </div>
                 </div>
               `;

               const marker = new AdvancedMarkerElement({
                 map: map.current,
                 position: { lat: location.latitude, lng: location.longitude },
                 content: markerElement,
                 title: report.holistic_summary.title
               });

               // Add click listener for marker
               markerElement.addEventListener('click', () => {
                 const timeAgo = Math.floor((Date.now() - report.holistic_summary.start_timestamp.getTime()) / 1000 / 60);
                 const sourceType = report.report_metadata.source_type;
                 const priority = report.holistic_summary.report_priority;
                 const topics = report.holistic_summary.topics.join(', ');
                 
                 // Create rich info window content
                 const infoContent = `
                   <div class="p-4 max-w-sm">
                     <div class="flex items-center gap-2 mb-2">
                       <h3 class="font-semibold text-base">${report.holistic_summary.title}</h3>
                       <span class="px-2 py-1 text-xs rounded-full ${getPriorityColor(priority)} text-white">${priority}</span>
                     </div>
                     <p class="text-sm text-gray-700 mb-3">${report.holistic_summary.details}</p>
                     <div class="space-y-1 text-xs text-gray-600">
                       <div><strong>Source:</strong> ${sourceType}</div>
                       <div><strong>Topics:</strong> ${topics}</div>
                       <div><strong>Locations:</strong> ${report.holistic_summary.location_names.join(', ')}</div>
                       <div><strong>Reported:</strong> ${timeAgo}m ago</div>
                     </div>
                   </div>
                 `;
                 
                 const infoWindow = new google.maps.InfoWindow({
                   content: infoContent
                 });
                 
                 infoWindow.open(map.current, marker);
               });

               markersRef.current.push(marker);
             }
           });
         }

                   // Add locality markers if venues exist and activeTab is 'venues'
          if (activeTab === 'venues' && venues.length > 0) {
            const localityColors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500'];
            
            // Show locality pins (always visible when venues exist)
            if (!selectedLocality) {
              venues.forEach((venueGroup, groupIndex) => {
                if (map.current && venueGroup.venues.length > 0) {
                  const localityColor = localityColors[groupIndex % localityColors.length];
                  const centerVenue = venueGroup.venues[0]; // Use first venue as locality center
                  
                                     // Create locality marker element with dynamic tagline
                   const locationData = lastGeminiResponse?.locations.find(loc => 
                     loc.name.toLowerCase() === venueGroup.location.toLowerCase()
                   );
                   const tagline = locationData?.tagline || "Hidden Gem";
                   const markerElement = document.createElement('div');
                   markerElement.innerHTML = `
                     <div class="relative flex flex-col items-center">
                       <!-- Tagline above pin -->
                       <div class="mb-1 bg-black/80 text-white px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap shadow-lg">
                         ${tagline}
                       </div>
                       <!-- Pin -->
                       <div class="relative w-12 h-12 rounded-full border-3 border-white shadow-floating cursor-pointer transition-all duration-300 ${localityColor} flex items-center justify-center hover:scale-110">
                         <div class="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                           <div class="w-3 h-3 ${localityColor} rounded-full"></div>
                         </div>
                         <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-white px-2 py-0.5 rounded-full shadow-sm">
                           <span class="text-xs font-semibold text-gray-700">${venueGroup.venues.length}</span>
                         </div>
                       </div>
                     </div>
                   `;

                  const localityMarker = new AdvancedMarkerElement({
                    map: map.current,
                    position: { lat: centerVenue.coordinates.latitude, lng: centerVenue.coordinates.longitude },
                    content: markerElement,
                    title: `${venueGroup.location} - ${venueGroup.venues.length} venues`
                  });

                  // Add click listener for locality marker
                  markerElement.addEventListener('click', () => {
                    setSelectedLocality(venueGroup.location);
                    if (map.current) {
                      map.current.panTo({ 
                        lat: centerVenue.coordinates.latitude, 
                        lng: centerVenue.coordinates.longitude 
                      });
                      map.current.setZoom(14);
                    }
                  });

                  markersRef.current.push(localityMarker);
                }
              });
            }
            
            // Show venue pins only when a locality is selected
            if (selectedLocality) {
              venues.forEach((venueGroup, groupIndex) => {
                // Only show venues for the selected locality
                if (venueGroup.location === selectedLocality) {
                  const localityColor = localityColors[groupIndex % localityColors.length];
                  
                  venueGroup.venues.forEach((venue) => {
                    if (map.current) {
                      // Create smaller custom venue marker element
                      const markerElement = document.createElement('div');
                      markerElement.innerHTML = `
                        <div class="relative w-8 h-8 rounded-full border-2 border-white shadow-floating cursor-pointer transition-all duration-300 ${localityColor} flex items-center justify-center hover:scale-110">
                          <div class="w-3 h-3 bg-white rounded-full flex items-center justify-center">
                            <div class="w-1.5 h-1.5 ${localityColor} rounded-full"></div>
                          </div>
                        </div>
                      `;

                      const venueMarker = new AdvancedMarkerElement({
                        map: map.current,
                        position: { lat: venue.coordinates.latitude, lng: venue.coordinates.longitude },
                        content: markerElement,
                        title: venue.name
                      });

                      // Add click listener for venue marker
                      markerElement.addEventListener('click', () => {
                        const priceText = getPriceText(venue.price_level);
                        const ratingStars = '★'.repeat(Math.floor(venue.rating)) + '☆'.repeat(5 - Math.floor(venue.rating));
                        
                        // Create rich info window content for venue
                        const infoContent = `
                          <div class="p-4 max-w-sm">
                            <div class="flex items-center gap-2 mb-2">
                              <h3 class="font-semibold text-base">${venue.name}</h3>
                              <span class="px-2 py-1 text-xs rounded-full ${localityColor} text-white">${venue.types[0]?.replace('_', ' ')}</span>
                            </div>
                            <div class="flex items-center gap-2 mb-2">
                              <span class="text-yellow-500">${ratingStars}</span>
                              <span class="text-sm text-gray-600">${venue.rating}/5 (${venue.user_ratings_total} reviews)</span>
                            </div>
                            <p class="text-sm text-gray-700 mb-2">${venue.address}</p>
                            <div class="space-y-1 text-xs text-gray-600">
                              <div><strong>Price Level:</strong> ${priceText}</div>
                              <div><strong>Status:</strong> ${venue.business_status}</div>
                              <div><strong>Locality:</strong> ${venue.locality || venueGroup.location}</div>
                              ${venue.opening_hours ? `<div><strong>Open Now:</strong> ${venue.opening_hours.open_now ? 'Yes' : 'No'}</div>` : ''}
                            </div>
                          </div>
                        `;
                        
                        const infoWindow = new google.maps.InfoWindow({
                          content: infoContent
                        });
                        
                        infoWindow.open(map.current, venueMarker);
                      });

                      venueMarkersRef.current.push(venueMarker);
                    }
                  });
                }
              });
            }
          }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setIsLoading(false);
      }
    };

    initMap();
     }, [googleMapsApiKey, mapData, venues, activeTab, selectedLocality]);

  // Firebase real-time data subscription
  useEffect(() => {
    const dataRef = ref(database, 'urbanReports');
    
    console.log('Attempting to connect to Firebase...');
    
    const unsubscribe = onValue(dataRef, (snapshot) => {
      console.log('Firebase connection successful!');
      if (snapshot.exists()) {
        console.log('Data received from Firebase:', snapshot.val());
        const data = snapshot.val();
        const formattedData: UrbanReport[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
          // Convert timestamp strings back to Date objects
          request: {
            ...data[key].request,
            reported_at_timestamp: data[key].request.reported_at_timestamp ? 
              new Date(data[key].request.reported_at_timestamp) : undefined
          },
          report_metadata: {
            ...data[key].report_metadata,
            reported_at_timestamp: new Date(data[key].report_metadata.reported_at_timestamp)
          },
          holistic_summary: {
            ...data[key].holistic_summary,
            start_timestamp: new Date(data[key].holistic_summary.start_timestamp),
            end_timestamp: new Date(data[key].holistic_summary.end_timestamp)
          }
        }));
        setMapData(formattedData);
      } else {
        console.log('No data exists in Firebase, using demo data');
        // Keep using demo data if Firebase is empty
      }
    }, (error) => {
      console.error('Firebase connection failed:', error);
      console.log('Using demo data instead');
      // Demo data is already set in useState, so no action needed
    });

    return () => {
      off(dataRef, 'value', unsubscribe);
    };
  }, []);

  const handleApiKeySubmit = (googleMapsApiKey: string, geminiApiKey: string) => {
    setGoogleMapsApiKey(googleMapsApiKey);
    setGeminiApiKey(geminiApiKey);
    setGeminiService(new GeminiService(geminiApiKey));
    setPlacesService(new PlacesService(googleMapsApiKey));
    setIsLoading(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Searching for:', query);
    
    // For non-natural language queries, we could implement basic map search
    // For now, let's at least show some feedback
    console.log('Basic search functionality - searching for:', query);
    
    // You could implement basic location search here
    // For example, search for the query on the map using Google Places Text Search
    if (map.current && query.trim()) {
      // Try to find the location on the map
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: query + ', Bengaluru, India' }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          map.current?.panTo(location);
          map.current?.setZoom(15);
          
          // Create a simple marker for the searched location
          const marker = new google.maps.Marker({
            position: location,
            map: map.current,
            title: query
          });
          
          // Remove the marker after 5 seconds
          setTimeout(() => {
            marker.setMap(null);
          }, 5000);
        } else {
          console.log('Location not found:', query);
        }
      });
    }
  };

  const handleNaturalLanguageSearch = async (query: string) => {
    if (!geminiService || !placesService) {
      console.error('Services not initialized');
      alert('Services not initialized. Please check your API keys.');
      return;
    }

    setIsProcessingSearch(true);
    setSearchQuery(query);
    
    try {
      console.log('🔍 Processing natural language query:', query);
      
      // Get location suggestions from Gemini
      console.log('📡 Calling Gemini API...');
      const geminiResponse = await geminiService.processLocationQuery(query);
      console.log('✅ Gemini response received:', geminiResponse);
      
      if (!geminiResponse || !geminiResponse.locations || geminiResponse.locations.length === 0) {
        console.error('❌ Empty or invalid Gemini response');
        alert('No locations found for your query. Try rephrasing your search.');
        return;
      }
      
      setLastGeminiResponse(geminiResponse);
      
             // Search for venues in the suggested locations (max 10 venues total across 3 locations)
       console.log('🏪 Searching for venues in locations:', geminiResponse.locations.map(l => l.name));
       const venueResults = await placesService.searchVenuesInMultipleLocations(
         geminiResponse.locations,
         geminiResponse.search_terms,
         4 // venues per location, max 12 total (will cap at 10)
       );
      
      console.log('✅ Venue search results:', venueResults);
      
      // Check if we got any venues
      const totalVenues = venueResults.reduce((total, group) => total + group.venues.length, 0);
      console.log(`📊 Total venues found: ${totalVenues}`);
      
      if (totalVenues === 0) {
        console.warn('⚠️ No venues found in any location');
        alert('No venues found in the suggested locations. This could be due to Google Places API quota limits or the locations being too specific.');
      }
      
             // Add locality info to venues and limit to max 10 venues total
       const venuesWithLocality = venueResults.map(result => ({
         ...result,
         venues: result.venues.map(venue => ({
           ...venue,
           locality: result.location
         }))
       }));
       
       // Limit to max 10 venues total across all locations
       let totalVenuesCount = 0;
       const limitedVenues = venuesWithLocality.map(result => ({
         ...result,
         venues: result.venues.filter(() => {
           if (totalVenuesCount < 10) {
             totalVenuesCount++;
             return true;
           }
           return false;
         })
       })).filter(result => result.venues.length > 0);
       
              setVenues(limitedVenues);
       setActiveTab('venues');
       setSelectedLocality(null); // Reset selected locality when new search is performed
      
      // Focus map on the first location if venues found
      if (venueResults.length > 0) {
        if (venueResults[0].venues.length > 0 && map.current) {
          const firstVenue = venueResults[0].venues[0];
          console.log('🗺️ Focusing map on first venue:', firstVenue.name);
          map.current.panTo({ 
            lat: firstVenue.coordinates.latitude, 
            lng: firstVenue.coordinates.longitude 
          });
          map.current.setZoom(14);
        } else if (geminiResponse.locations.length > 0 && map.current) {
          // If no venues found but we have locations, focus on first location
          const firstLocation = geminiResponse.locations[0];
          console.log('🗺️ Focusing map on first location:', firstLocation.name);
          map.current.panTo({ 
            lat: firstLocation.coordinates.latitude, 
            lng: firstLocation.coordinates.longitude 
          });
          map.current.setZoom(13);
        }
      }
      
    } catch (error) {
      console.error('❌ Error processing natural language search:', error);
      alert(`Search failed: ${error.message}. Please check your API keys and try again.`);
    } finally {
      setIsProcessingSearch(false);
    }
  };

  // Show API key input if no keys are available
  if (!googleMapsApiKey || !geminiApiKey) {
    return <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />;
  }

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      {/* Map container */}
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="flex items-center gap-3 bg-surface-elevated rounded-lg px-6 py-4 shadow-floating">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-foreground font-medium">Loading Google Maps...</span>
          </div>
        </div>
      )}
      
      {/* Map pins overlay - only show if map is loaded */}
      {!isLoading && (
        <div className="absolute inset-0 pointer-events-none z-30">
          {/* Legacy overlay pins disabled for Google Maps */}
        </div>
      )}
      
      {/* Search input */}
      <SearchInput 
        onSearch={handleSearch} 
        onNaturalLanguageSearch={handleNaturalLanguageSearch}
        isProcessing={isProcessingSearch}
      />
      
      {/* Live Events & Venues Panel */}
      <div className="absolute top-24 left-6 right-6 md:right-auto bg-surface-glass backdrop-blur-lg rounded-xl shadow-soft border border-border/50 z-40 max-w-md md:w-96">
        {/* Header with Tabs */}
        <div className="px-4 py-3 border-b border-border/50">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-foreground">Bengaluru Live</h1>
            <button
              onClick={() => {
                if (activeTab === 'events') {
                  setIsEventsExpanded(!isEventsExpanded);
                } else {
                  setIsVenuesExpanded(!isVenuesExpanded);
                }
              }}
              className="p-2 hover:bg-surface-elevated rounded-lg transition-colors"
              aria-label="Toggle panel"
            >
              {(activeTab === 'events' ? isEventsExpanded : isVenuesExpanded) ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-muted/50 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('events')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'events'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Events ({mapData.length})
            </button>
            <button
              onClick={() => setActiveTab('venues')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'venues'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Venues ({venues.reduce((acc, group) => acc + group.venues.length, 0)})
            </button>
          </div>
          
          {/* Tab Content Info */}
          <p className="text-sm text-muted-foreground mt-2">
            {activeTab === 'events' 
              ? `${mapData.length} active events • Updated real-time`
              : lastGeminiResponse 
                ? `${lastGeminiResponse.query_type} in ${lastGeminiResponse.locations.length} areas`
                : 'Ask AI to find venues'
            }
          </p>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'events' && isEventsExpanded && (
          <div className="max-h-64 md:max-h-96 overflow-y-auto">
          {mapData.map((report, index) => {
            const timeAgo = Math.floor((Date.now() - report.holistic_summary.start_timestamp.getTime()) / 1000 / 60);
            const priorityColor = getPriorityColor(report.holistic_summary.report_priority);
            
            return (
              <div 
                key={report.id}
                className="px-4 py-3 border-b border-border/20 last:border-b-0 hover:bg-surface-elevated/50 cursor-pointer transition-colors"
                onClick={() => {
                  // Focus on the map location when clicked
                  if (map.current && report.holistic_summary.locations.length > 0) {
                    const location = report.holistic_summary.locations[0];
                    map.current.panTo({ lat: location.latitude, lng: location.longitude });
                    map.current.setZoom(15);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Priority indicator */}
                  <div className={`w-3 h-3 rounded-full ${priorityColor} mt-1 flex-shrink-0`} />
                  
                  <div className="flex-1 min-w-0">
                    {/* Title and Priority */}
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm text-foreground truncate">
                        {report.holistic_summary.title}
                      </h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${priorityColor} text-white flex-shrink-0`}>
                        {report.holistic_summary.report_priority}
                      </span>
                    </div>
                    
                    {/* Details */}
                    <p className="text-xs text-muted-foreground mb-2 overflow-hidden" 
                       style={{ 
                         display: '-webkit-box',
                         WebkitLineClamp: 2,
                         WebkitBoxOrient: 'vertical' as any
                       }}>
                      {report.holistic_summary.details}
                    </p>
                    
                    {/* Metadata row */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-current rounded opacity-60" />
                        {report.report_metadata.source_type}
                      </span>
                      <span>{timeAgo}m ago</span>
                      {report.holistic_summary.location_names.length > 0 && (
                        <span className="truncate">
                          📍 {report.holistic_summary.location_names[0]}
                        </span>
                      )}
                    </div>
                    
                    {/* Topics */}
                    {report.holistic_summary.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {report.holistic_summary.topics.slice(0, 3).map((topic) => (
                          <span 
                            key={topic}
                            className="px-2 py-0.5 text-xs bg-surface-elevated rounded text-muted-foreground"
                          >
                            {topic}
                          </span>
                        ))}
                        {report.holistic_summary.topics.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{report.holistic_summary.topics.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {mapData.length === 0 && (
            <div className="px-4 py-6 text-center text-muted-foreground">
              <p className="text-sm">No active events</p>
              <p className="text-xs">Reports will appear here in real-time</p>
            </div>
          )}
          </div>
        )}
        
                                   {/* Venues List */}
          {activeTab === 'venues' && isVenuesExpanded && (
            <div className="max-h-64 md:max-h-96 overflow-y-auto">
              {!selectedLocality ? (
                // Show only localities when none is selected
                venues.map((venueGroup, groupIndex) => {
                  // Define locality colors to match map markers
                  const localityColors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500'];
                  const localityColor = localityColors[groupIndex % localityColors.length];
                  
                  return (
                                         <div 
                       key={`${venueGroup.location}-${groupIndex}`}
                       className="px-4 py-3 bg-muted/30 border-b border-border/20 cursor-pointer hover:bg-muted/50 transition-colors"
                       onClick={() => {
                         // Select this locality and focus map on it
                         setSelectedLocality(venueGroup.location);
                         if (map.current && venueGroup.venues.length > 0) {
                           const firstVenue = venueGroup.venues[0];
                           map.current.panTo({ 
                             lat: firstVenue.coordinates.latitude, 
                             lng: firstVenue.coordinates.longitude 
                           });
                           map.current.setZoom(14);
                         }
                       }}
                     >
                       <div className="flex items-center gap-3">
                         <div className={`w-4 h-4 rounded-full ${localityColor}`} />
                         <div>
                           <h4 className="text-sm font-semibold text-foreground">{venueGroup.location}</h4>
                           <p className="text-xs text-orange-600 font-medium italic mb-1">
                             {lastGeminiResponse?.locations.find(loc => 
                               loc.name.toLowerCase() === venueGroup.location.toLowerCase()
                             )?.tagline || "Hidden Gem"}
                           </p>
                           <p className="text-xs text-muted-foreground">{venueGroup.venues.length} venues • Click to explore</p>
                         </div>
                       </div>
                     </div>
                  );
                })
              ) : (
                // Show venues for selected locality with back button
                <>
                  {/* Back button */}
                  <div 
                    className="px-4 py-3 bg-muted/50 border-b border-border/20 cursor-pointer hover:bg-muted/70 transition-colors"
                    onClick={() => {
                      setSelectedLocality(null);
                      // Reset map view to show all areas
                      if (map.current) {
                        map.current.setZoom(11);
                        map.current.panTo({ lat: 12.9716, lng: 77.5946 }); // Bengaluru center
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">←</span>
                      <span className="text-sm font-medium text-foreground">Back to all localities</span>
                    </div>
                  </div>
                  
                  {venues
                    .filter(venueGroup => venueGroup.location === selectedLocality)
                    .map((venueGroup, groupIndex) => {
                      const localityColors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500'];
                      const originalIndex = venues.findIndex(v => v.location === selectedLocality);
                      const localityColor = localityColors[originalIndex % localityColors.length];
                      
                      return (
                        <div key={`${venueGroup.location}-${groupIndex}`}>
                                                     {/* Selected Locality Header */}
                           <div className="px-4 py-3 bg-muted/30 border-b border-border/20">
                             <div className="flex items-center gap-3">
                               <div className={`w-4 h-4 rounded-full ${localityColor}`} />
                                                               <div>
                                  <h4 className="text-sm font-semibold text-foreground">{venueGroup.location}</h4>
                                  <p className="text-xs text-orange-600 font-medium italic mb-1">
                                    {lastGeminiResponse?.locations.find(loc => 
                                      loc.name.toLowerCase() === venueGroup.location.toLowerCase()
                                    )?.tagline || "Hidden Gem"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{venueGroup.venues.length} venues in this area</p>
                                </div>
                             </div>
                           </div>
                          
                          {/* Venues in this location */}
                          {venueGroup.venues.map((venue, venueIndex) => {
                            const priceText = getPriceText(venue.price_level);
                            
                            return (
                              <div 
                                key={`${venue.id}-${venueIndex}`}
                                className="px-4 py-3 border-b border-border/20 last:border-b-0 hover:bg-surface-elevated/50 cursor-pointer transition-colors"
                                onClick={() => {
                                  // Focus on the venue when clicked
                                  if (map.current) {
                                    map.current.panTo({ 
                                      lat: venue.coordinates.latitude, 
                                      lng: venue.coordinates.longitude 
                                    });
                                    map.current.setZoom(17);
                                  }
                                }}
                              >
                                <div className="flex items-start gap-3">
                                  {/* Venue indicator - smaller dot matching locality color */}
                                  <div className={`w-2 h-2 rounded-full ${localityColor} mt-2 flex-shrink-0`} />
                                  
                                  <div className="flex-1 min-w-0">
                                    {/* Name and type */}
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-semibold text-sm text-foreground truncate">
                                        {venue.name}
                                      </h3>
                                      <span className={`px-2 py-0.5 text-xs rounded-full ${localityColor} text-white flex-shrink-0`}>
                                        {venue.types[0]?.replace('_', ' ') || 'venue'}
                                      </span>
                                    </div>
                                    
                                    {/* Rating and price */}
                                    <div className="flex items-center gap-3 mb-1">
                                      <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                        <span className="text-xs text-muted-foreground">
                                          {venue.rating}/5 ({venue.user_ratings_total})
                                        </span>
                                      </div>
                                      {venue.price_level && (
                                        <div className="flex items-center gap-1">
                                          <DollarSign className="w-3 h-3 text-green-500" />
                                          <span className="text-xs text-muted-foreground">{priceText}</span>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Address */}
                                    <p className="text-xs text-muted-foreground mb-2 overflow-hidden" 
                                       style={{ 
                                         display: '-webkit-box',
                                         WebkitLineClamp: 1,
                                         WebkitBoxOrient: 'vertical' as any
                                       }}>
                                      📍 {venue.address}
                                    </p>
                                    
                                    {/* Status and opening hours */}
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <div className={`w-2 h-2 rounded-full ${
                                          venue.business_status === 'OPERATIONAL' ? 'bg-green-500' : 'bg-red-500'
                                        }`} />
                                        {venue.business_status === 'OPERATIONAL' ? 'Open' : 'Closed'}
                                      </span>
                                      {venue.opening_hours && (
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {venue.opening_hours.open_now ? 'Open now' : 'Closed now'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                </>
              )}
              
              {venues.length === 0 && (
                <div className="px-4 py-6 text-center text-muted-foreground">
                  <p className="text-sm">No venues found</p>
                  <p className="text-xs">Try asking AI: "Show me party hubs in Bengaluru"</p>
                </div>
              )}
            </div>
          )}
      </div>
      
      {/* Legend */}
      <div className="absolute top-24 right-6 bg-surface-glass backdrop-blur-lg rounded-xl p-4 shadow-soft border border-border/50 z-40">
        <h3 className="text-sm font-semibold text-foreground mb-3">Live Urban Reports</h3>
        
        {/* Priority Legend */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-foreground mb-2">Priority Levels</h4>
          <div className="space-y-1">
            {[
              { priority: Priority.HIGH, label: 'High Priority', color: 'bg-red-500' },
              { priority: Priority.MEDIUM, label: 'Medium Priority', color: 'bg-orange-500' },
              { priority: Priority.LOW, label: 'Low Priority', color: 'bg-green-500' },
            ].map(({ priority, label, color }) => (
              <div key={priority} className="flex items-center gap-2 text-xs">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span className="text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Source Types */}
        <div>
          <h4 className="text-xs font-medium text-foreground mb-2">Source Types</h4>
          <div className="space-y-1">
            {[
              { source: SourceType.AUTHORITY, label: 'Government/Authority' },
              { source: SourceType.BUSINESS, label: 'Business' },
              { source: SourceType.USER, label: 'Citizen Reports' },
              { source: SourceType.OTHER, label: 'Other Sources' },
            ].map(({ source, label }) => (
              <div key={source} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded border border-gray-400" />
                <span className="text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapDashboard; 
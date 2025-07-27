# AI-Powered Search Integration

This document describes the integration of Gemini LLM with Google Maps for natural language venue search in Bengaluru.

## Overview

The application now supports natural language queries that are processed by Google's Gemini AI to find and display venues on the map. Users can ask questions like "Show me party hubs in Bengaluru" and get structured results with venue markers on the map.

## Features

### 🤖 Natural Language Processing
- **Gemini AI Integration**: Processes natural language queries to understand user intent
- **Structured Responses**: Returns location data with coordinates and search terms
- **Context Awareness**: Understands Bengaluru-specific locations and categories

### 🗺️ Smart Venue Search
- **Google Places Integration**: Searches for venues using Google Places API
- **Multiple Locations**: Searches across multiple areas simultaneously
- **Venue Filtering**: Filters results by relevance (bars, pubs, restaurants, cafes)
- **Rating-Based Sorting**: Orders venues by rating and review count

### 🎯 Interactive Map Experience
- **Dual Marker System**: 
  - Urban report markers (traffic, events) in larger circles
  - Venue markers in smaller circles with type-based colors
- **Rich Info Windows**: Detailed venue information including ratings, price, hours
- **Click-to-Focus**: Click venues in sidebar to focus map on location

### 📱 Enhanced UI
- **Tabbed Interface**: Switch between Events and Venues views
- **Real-time Processing**: Loading indicators during AI processing
- **Smart Suggestions**: Context-aware search suggestions
- **Responsive Design**: Works on desktop and mobile

## Setup Instructions

### 1. API Keys Required

You need two API keys:

#### Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - Maps JavaScript API
   - Places API
4. Create credentials (API key)
5. Restrict the key to your domain for security

#### Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key for use in the application

### 2. Application Setup

1. **Install Dependencies**:
   ```bash
   npm install @google/generative-ai
   ```

2. **Start the Application**:
   ```bash
   npm run dev
   ```

3. **Enter API Keys**:
   - The app will prompt for both API keys on first launch
   - Keys are stored locally in browser storage
   - No keys are sent to external servers

## Usage Guide

### Basic Search Queries

#### Party/Nightlife Queries
- "Show me party hubs in Bengaluru"
- "Best pubs in Koramangala and Indiranagar"
- "Nightlife spots in Brigade Road"

#### Restaurant Queries
- "Good restaurants in HSR Layout"
- "Best food places near Whitefield"
- "Fine dining in UB City Mall"

#### Specific Venue Types
- "Coffee shops in Jayanagar"
- "Bars with live music in Bengaluru"
- "Rooftop restaurants in the city"

### Advanced Features

#### Query Understanding
The system automatically detects natural language queries vs. simple searches:
- **Natural Language**: "Where can I find good pubs?" → Processed by Gemini
- **Simple Search**: "MG Road traffic" → Direct map search

#### Location Intelligence
Gemini understands Bengaluru geography:
- Popular areas: Koramangala, Indiranagar, Whitefield, HSR Layout
- Landmarks: Brigade Road, UB City Mall, Palace Grounds
- Context: Tech areas, nightlife zones, shopping districts

#### Venue Information
Each venue shows:
- **Rating**: Star rating and review count
- **Price Level**: $ to $$$$ indicators
- **Business Status**: Open/Closed
- **Operating Hours**: Current open/closed status
- **Address**: Full address and locality
- **Venue Type**: Bar, Restaurant, Cafe, etc.

## Technical Implementation

### Architecture

```
User Query → SearchInput → MapDashboard
     ↓
Natural Language Detection
     ↓
Gemini Service → Location Analysis → Structured Response
     ↓
Places Service → Venue Search → Filtered Results
     ↓
Map Rendering → Markers → UI Update
```

### Key Components

#### `GeminiService` (`/src/services/geminiAPI.ts`)
- Processes natural language queries
- Returns structured location data
- Handles Bengaluru-specific context

#### `PlacesService` (`/src/services/placesAPI.ts`)
- Searches venues using Google Places API
- Filters and sorts results
- Handles multiple location searches

#### `SearchInput` (`/src/components/SearchInput.tsx`)
- Detects query type (natural language vs simple)
- Shows processing states
- Provides contextual suggestions

#### `MapDashboard` (`/src/components/MapDashboard.tsx`)
- Manages map state and markers
- Handles AI service integration
- Renders venues in sidebar and map

### Data Flow

1. **User Input**: Natural language query in search bar
2. **Query Processing**: Gemini analyzes query and returns locations
3. **Venue Search**: Places API searches each location for venues
4. **Result Processing**: Venues are filtered, sorted, and enhanced
5. **Map Update**: New markers added to map
6. **UI Update**: Venues displayed in sidebar with details

## Example Interactions

### Query: "Show me party hubs in Bengaluru"

**Gemini Response**:
```json
{
  "locations": [
    {
      "name": "Koramangala",
      "coordinates": { "latitude": 12.9279, "longitude": 77.6271 },
      "description": "Trendy nightlife area with pubs and bars",
      "category": "nightlife"
    },
    {
      "name": "Indiranagar",
      "coordinates": { "latitude": 12.9716, "longitude": 77.6412 },
      "description": "Popular entertainment district",
      "category": "nightlife"
    }
  ],
  "query_type": "party_hubs",
  "search_terms": ["pubs", "bars", "nightclubs"]
}
```

**Result**: 6-12 top-rated pubs and bars displayed across both areas with markers on map.

### Query: "Best restaurants in HSR Layout"

**Expected Results**:
- 6 top-rated restaurants in HSR Layout
- Markers clustered around HSR Layout area
- Restaurant details with ratings, cuisine type, price level
- Map focused on HSR Layout with appropriate zoom

## Troubleshooting

### Common Issues

#### "Services not initialized"
- **Cause**: API keys not properly set
- **Solution**: Re-enter API keys in settings

#### "Google Maps not loaded"
- **Cause**: Google Maps API key invalid or missing permissions
- **Solution**: Check API key and enable required APIs

#### "No venues found"
- **Cause**: Query too specific or API quota exceeded
- **Solution**: Try broader queries or check API quotas

#### Empty Gemini response
- **Cause**: Gemini API key invalid or query not understood
- **Solution**: Check API key and rephrase query

### Performance Tips

1. **API Quota Management**:
   - Gemini: 60 requests per minute (free tier)
   - Places: 1000 requests per day (free tier)

2. **Query Optimization**:
   - Use specific area names for better results
   - Include venue type keywords
   - Avoid overly complex queries

3. **Caching**:
   - Results are not cached currently
   - Each query triggers new API calls
   - Consider implementing caching for production

## Future Enhancements

### Planned Features
- **Query History**: Save and replay previous searches
- **Favorites**: Save favorite venues
- **Directions**: Integrate with Google Maps directions
- **Reviews**: Show recent reviews from Google
- **Photos**: Display venue photos from Google Places
- **Filters**: Filter by price, rating, open status
- **Recommendations**: AI-powered venue recommendations

### Technical Improvements
- **Result Caching**: Cache Gemini and Places responses
- **Offline Support**: Store popular venues for offline access
- **Performance**: Lazy loading and pagination for large result sets
- **Analytics**: Track query patterns and popular areas

## Security Notes

1. **API Key Storage**: Keys are stored in browser localStorage only
2. **No Server Storage**: Keys are never sent to application servers
3. **Domain Restrictions**: Recommend restricting Google API keys to your domain
4. **Rate Limiting**: Both APIs have rate limits - implement appropriate handling

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify API keys are valid and have required permissions
3. Test with simple queries first
4. Check API quotas in respective consoles

---

**Built with**: React, TypeScript, Google Maps API, Google Places API, Gemini AI, Tailwind CSS 
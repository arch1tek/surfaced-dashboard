# Urban Reports Integration Guide

This document explains how the metadata from `archis.py` is integrated with the Bengaluru Vibe Map webapp.

## Overview

The webapp has been enhanced to work with rich urban report data that matches the Python data models defined in `archis.py`. Instead of simple map pins, the application now displays comprehensive urban reports with metadata about priority, source types, verification status, and more.

## Key Components

### 1. Type Definitions (`src/types/urbanReport.ts`)

TypeScript interfaces that mirror the Python Pydantic models:

- `UrbanReport` - Main report structure
- `HolisticSummary` - Contains location data, topics, priority, timestamps
- `ReportMetadata` - Source information and categorization
- `Location` - Latitude/longitude coordinates
- Enums: `SourceType`, `ReportType`, `Priority`, `VerificationStatus`

### 2. Data Conversion Utilities (`src/utils/dataConverter.ts`)

Functions to convert between Python backend format and TypeScript frontend format:

- `convertPythonUrbanReport()` - Converts single report from API
- `convertPythonUrbanReportsArray()` - Converts array of reports
- `convertToAPIFormat()` - Prepares data for API submission
- Various filtering functions for priority, location, topics, etc.

### 3. API Service (`src/services/urbanReportAPI.ts`)

Complete API integration service with methods for:

- Fetching all reports
- Getting reports by location/radius
- Filtering by topics, time range
- Real-time WebSocket updates
- Submitting new reports

### 4. Enhanced Map Display (`src/components/MapDashboard.tsx`)

Updated to display rich urban report data:

- **Priority-based marker colors**: High (red), Medium (orange), Low (green)
- **Rich info windows** showing:
  - Report title and detailed description
  - Source type (Authority, Business, User, Other)
  - Topics and location names
  - Priority level and verification status
  - Timestamps
- **Enhanced legend** showing priority levels and source types

## Data Structure Mapping

### From Python `UrbanReport` to Map Display:

```python
# Python archis.py model
UrbanReport:
  holistic_summary:
    locations: [Location]  # → Map pin positions
    title: str            # → Pin title
    details: str          # → Info window description
    report_priority: Priority  # → Pin color
    topics: [str]         # → Displayed in info window
    location_names: [str] # → Displayed in info window
```

### Map Pin Colors by Priority:

- 🔴 **High Priority**: Red markers (traffic emergencies, safety issues)
- 🟠 **Medium Priority**: Orange markers (events, moderate disruptions)
- 🟢 **Low Priority**: Green markers (maintenance, minor updates)

## Demo Data

The application includes rich demo data that demonstrates the full capabilities:

1. **High Priority Traffic** - MG Road construction with authority source
2. **Medium Priority Event** - Literature Festival at Palace Grounds
3. **Medium Priority Infrastructure** - Road closure in Whitefield
4. **Medium Priority Transit** - Metro delays on Purple Line
5. **Low Priority Utility** - Power maintenance in HSR Layout

## Integration with Your Python Backend

### 1. API Endpoints Expected

Your Python backend should provide these endpoints:

```
GET /api/urban-reports                    # Get all reports
GET /api/urban-reports/location           # Get by location + radius
GET /api/urban-reports/topics             # Filter by topics
GET /api/urban-reports/time-range         # Filter by time
POST /api/urban-reports                   # Submit new report
GET /api/urban-reports/{id}               # Get specific report
WS /ws/urban-reports                      # Real-time updates
```

### 2. Data Format

Your API should return UrbanReport objects serialized to JSON, with ISO string timestamps:

```json
{
  "id": "report-uuid",
  "request": { ... },
  "report_metadata": {
    "source_type": "AUTHORITY",
    "report_type": "CURRENT_EVENT",
    "report_priority": "HIGH",
    "report_topics": ["traffic", "infrastructure"],
    "reported_at_timestamp": "2024-01-15T10:30:00Z"
  },
  "holistic_summary": {
    "title": "Heavy Traffic - MG Road",
    "details": "Traffic jam due to construction...",
    "locations": [{"latitude": 12.9716, "longitude": 77.5946}],
    "location_names": ["MG Road", "Brigade Road Junction"],
    "topics": ["traffic", "infrastructure"],
    "report_priority": "HIGH",
    "start_timestamp": "2024-01-15T10:30:00Z",
    "end_timestamp": "2024-01-15T11:30:00Z"
  }
}
```

### 3. Environment Configuration

Set your backend URL in `.env`:

```
REACT_APP_API_BASE_URL=http://your-python-backend:8000
```

### 4. Using the API Service

Replace the demo data usage in `MapDashboard.tsx`:

```typescript
import { UrbanReportAPI } from '@/services/urbanReportAPI';

// Replace useState with API call
useEffect(() => {
  const fetchReports = async () => {
    const reports = await UrbanReportAPI.getAllReports();
    setMapData(reports);
  };
  
  fetchReports();
}, []);
```

## Features

### Rich Map Markers
- Color-coded by priority level
- Click to see detailed information
- Displays source type, topics, and locations

### Real-time Updates
- WebSocket integration for live data
- Automatic map updates when new reports arrive

### Advanced Filtering
- Filter by priority level
- Filter by source type (Authority, Business, User, Other)
- Geographic boundary filtering
- Topic-based filtering
- Time range filtering

### Firebase Integration
- Real-time database updates from path `urbanReports/`
- Automatic date conversion from stored strings

## Next Steps

1. **Set up your Python backend** with the required API endpoints
2. **Configure environment variables** to point to your backend
3. **Replace demo data** with API calls
4. **Implement real-time updates** using WebSocket connection
5. **Add filtering UI** to let users filter by priority, topics, etc.

The integration is designed to be seamless - your Python `UrbanReport` objects will automatically display as rich, interactive map pins with all the metadata visible to users. 
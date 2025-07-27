// TypeScript interfaces matching the Python models from archis.py

export enum SourceType {
  BUSINESS = "BUSINESS",
  AUTHORITY = "AUTHORITY", 
  USER = "USER",
  OTHER = "OTHER"
}

export enum ReportType {
  PAST_EVENT = "PAST_EVENT",
  CURRENT_EVENT = "CURRENT_EVENT", 
  FUTURE_EVENT = "FUTURE_EVENT"
}

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH", 
  NA = "NA"
}

export enum VerificationStatus {
  PENDING = "PENDING",
  REJECTED = "REJECTED",
  VERIFIED = "VERIFIED"
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface IngestRequest {
  id: string;
  source_type: SourceType;
  source_id: string;
  text?: string;
  reported_from_location?: Location;
  reported_at_timestamp?: Date;
}

export interface FileMetadata {
  file_id: string;
  file_type: string;
  timestamp?: Date;
  location?: Location;
  location_name?: string;
  file_description: string;
}

export interface TextMetadata {
  text: string;
  original_language: string;
  normalized_description: string;
  location_names: string[];
  locations: Location[];
  datetime_mentions: (Date | [Date, Date])[];
}

export interface ReportMetadata {
  source_type: SourceType;
  report_type: ReportType;
  report_priority: Priority;
  report_topics: string[];
  reported_at_timestamp: Date;
  reported_from_location: Location;
}

export interface CheckMetadata {
  score: number; // 0-5
  reason: string;
}

export interface VerificationMetadata {
  status: VerificationStatus;
  reason: string;
  validity_scores: number; // 0-125
  triviality_check_metadata: CheckMetadata;
  location_datetime_check_metadata: CheckMetadata;
  coherence_check_metadata: CheckMetadata;
}

export interface HolisticSummary {
  id: string;
  title: string;
  details: string;
  locations: Location[];
  location_names: string[];
  files: string[];
  topics: string[];
  report_type: ReportType;
  report_priority: Priority;
  start_timestamp: Date;
  end_timestamp: Date;
}

export interface UrbanReport {
  id: string;
  request: IngestRequest;
  file_metadata?: FileMetadata;
  text_metadata?: TextMetadata;
  report_metadata: ReportMetadata;
  verification_metadata?: VerificationMetadata;
  holistic_summary: HolisticSummary;
}

// Topics configuration matching Python
export const TOPICS_CONFIG = {
  authority: ["traffic", "emergency", "civic", "infrastructure", "safety"],
  business: ["opening", "closing", "promotion", "service", "hiring"],
  community: ["event", "gathering", "celebration", "protest", "meeting"],
  health: ["medical", "wellness", "epidemic", "health_alert"],
  transport: ["metro", "bus", "traffic", "parking", "road_closure", "air_transport"],
  utility: ["power", "water", "internet", "maintenance"],
  weather: ["rain", "flood", "heat_wave", "storm", "aqi"],
  dining: ["new_restaurant", "food_festival", "offers", "reviews"],
  entertainment: ["movie", "concert", "theater", "sports"],
} as const;

export const ALL_TOPICS = Object.values(TOPICS_CONFIG).flat();

// Helper function to get topic category
export function getTopicCategory(topic: string): string | null {
  for (const [category, topics] of Object.entries(TOPICS_CONFIG)) {
    if ((topics as readonly string[]).includes(topic)) {
      return category;
    }
  }
  return null;
}

// Helper function to get priority color
export function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case Priority.HIGH:
      return 'bg-red-500';
    case Priority.MEDIUM:
      return 'bg-orange-500';
    case Priority.LOW:
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
}

// Helper function to get report type color
export function getReportTypeColor(reportType: ReportType): string {
  switch (reportType) {
    case ReportType.CURRENT_EVENT:
      return 'bg-blue-500';
    case ReportType.FUTURE_EVENT:
      return 'bg-purple-500';
    case ReportType.PAST_EVENT:
      return 'bg-gray-500';
    default:
      return 'bg-blue-500';
  }
} 
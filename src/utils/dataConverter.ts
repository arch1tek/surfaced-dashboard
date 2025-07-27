// Utility functions to convert data between Python backend and TypeScript frontend

import { UrbanReport, SourceType, ReportType, Priority, VerificationStatus } from '@/types/urbanReport';

/**
 * Convert Python UrbanReport data from API to TypeScript UrbanReport
 * Handles date string conversion and enum validation
 */
export function convertPythonUrbanReport(pythonData: any): UrbanReport {
  return {
    id: pythonData.id,
    request: {
      id: pythonData.request.id,
      source_type: pythonData.request.source_type as SourceType,
      source_id: pythonData.request.source_id,
      text: pythonData.request.text || undefined,
      reported_from_location: pythonData.request.reported_from_location || undefined,
      reported_at_timestamp: pythonData.request.reported_at_timestamp ? 
        new Date(pythonData.request.reported_at_timestamp) : undefined
    },
    file_metadata: pythonData.file_metadata ? {
      file_id: pythonData.file_metadata.file_id,
      file_type: pythonData.file_metadata.file_type,
      timestamp: pythonData.file_metadata.timestamp ? 
        new Date(pythonData.file_metadata.timestamp) : undefined,
      location: pythonData.file_metadata.location || undefined,
      location_name: pythonData.file_metadata.location_name || undefined,
      file_description: pythonData.file_metadata.file_description
    } : undefined,
    text_metadata: pythonData.text_metadata ? {
      text: pythonData.text_metadata.text,
      original_language: pythonData.text_metadata.original_language,
      normalized_description: pythonData.text_metadata.normalized_description,
      location_names: pythonData.text_metadata.location_names || [],
      locations: pythonData.text_metadata.locations || [],
      datetime_mentions: (pythonData.text_metadata.datetime_mentions || []).map((mention: any) => {
        if (Array.isArray(mention)) {
          return [new Date(mention[0]), new Date(mention[1])];
        }
        return new Date(mention);
      })
    } : undefined,
    report_metadata: {
      source_type: pythonData.report_metadata.source_type as SourceType,
      report_type: pythonData.report_metadata.report_type as ReportType,
      report_priority: pythonData.report_metadata.report_priority as Priority,
      report_topics: pythonData.report_metadata.report_topics || [],
      reported_at_timestamp: new Date(pythonData.report_metadata.reported_at_timestamp),
      reported_from_location: pythonData.report_metadata.reported_from_location
    },
    verification_metadata: pythonData.verification_metadata ? {
      status: pythonData.verification_metadata.status as VerificationStatus,
      reason: pythonData.verification_metadata.reason,
      validity_scores: pythonData.verification_metadata.validity_scores,
      triviality_check_metadata: pythonData.verification_metadata.triviality_check_metadata,
      location_datetime_check_metadata: pythonData.verification_metadata.location_datetime_check_metadata,
      coherence_check_metadata: pythonData.verification_metadata.coherence_check_metadata
    } : undefined,
    holistic_summary: {
      id: pythonData.holistic_summary.id,
      title: pythonData.holistic_summary.title,
      details: pythonData.holistic_summary.details,
      locations: pythonData.holistic_summary.locations || [],
      location_names: pythonData.holistic_summary.location_names || [],
      files: pythonData.holistic_summary.files || [],
      topics: pythonData.holistic_summary.topics || [],
      report_type: pythonData.holistic_summary.report_type as ReportType,
      report_priority: pythonData.holistic_summary.report_priority as Priority,
      start_timestamp: new Date(pythonData.holistic_summary.start_timestamp),
      end_timestamp: new Date(pythonData.holistic_summary.end_timestamp)
    }
  };
}

/**
 * Convert multiple Python UrbanReports to TypeScript format
 */
export function convertPythonUrbanReportsArray(pythonDataArray: any[]): UrbanReport[] {
  return pythonDataArray.map(convertPythonUrbanReport);
}

/**
 * Convert TypeScript UrbanReport to Python-compatible format for API calls
 */
export function convertToAPIFormat(report: UrbanReport): any {
  return {
    id: report.id,
    request: {
      ...report.request,
      reported_at_timestamp: report.request.reported_at_timestamp?.toISOString()
    },
    file_metadata: report.file_metadata ? {
      ...report.file_metadata,
      timestamp: report.file_metadata.timestamp?.toISOString()
    } : undefined,
    text_metadata: report.text_metadata ? {
      ...report.text_metadata,
      datetime_mentions: report.text_metadata.datetime_mentions.map(mention => {
        if (Array.isArray(mention)) {
          return [mention[0].toISOString(), mention[1].toISOString()];
        }
        return mention.toISOString();
      })
    } : undefined,
    report_metadata: {
      ...report.report_metadata,
      reported_at_timestamp: report.report_metadata.reported_at_timestamp.toISOString()
    },
    verification_metadata: report.verification_metadata,
    holistic_summary: {
      ...report.holistic_summary,
      start_timestamp: report.holistic_summary.start_timestamp.toISOString(),
      end_timestamp: report.holistic_summary.end_timestamp.toISOString()
    }
  };
}

/**
 * Validate that a Python object has the required UrbanReport structure
 */
export function isValidUrbanReportData(data: any): boolean {
  return (
    data &&
    typeof data.id === 'string' &&
    data.request &&
    data.report_metadata &&
    data.holistic_summary &&
    data.holistic_summary.locations &&
    Array.isArray(data.holistic_summary.locations) &&
    data.holistic_summary.locations.length > 0
  );
}

/**
 * Filter reports by priority
 */
export function filterByPriority(reports: UrbanReport[], priorities: Priority[]): UrbanReport[] {
  return reports.filter(report => priorities.includes(report.holistic_summary.report_priority));
}

/**
 * Filter reports by source type
 */
export function filterBySourceType(reports: UrbanReport[], sourceTypes: SourceType[]): UrbanReport[] {
  return reports.filter(report => sourceTypes.includes(report.report_metadata.source_type));
}

/**
 * Filter reports by topics
 */
export function filterByTopics(reports: UrbanReport[], topics: string[]): UrbanReport[] {
  return reports.filter(report => 
    report.holistic_summary.topics.some(topic => topics.includes(topic))
  );
}

/**
 * Get reports within a geographical bounding box
 */
export function filterByGeographicalBounds(
  reports: UrbanReport[], 
  bounds: { north: number; south: number; east: number; west: number }
): UrbanReport[] {
  return reports.filter(report => 
    report.holistic_summary.locations.some(location => 
      location.latitude >= bounds.south &&
      location.latitude <= bounds.north &&
      location.longitude >= bounds.west &&
      location.longitude <= bounds.east
    )
  );
}

/**
 * Get reports within a time range
 */
export function filterByTimeRange(
  reports: UrbanReport[], 
  startTime: Date, 
  endTime: Date
): UrbanReport[] {
  return reports.filter(report => 
    report.holistic_summary.start_timestamp >= startTime &&
    report.holistic_summary.start_timestamp <= endTime
  );
} 
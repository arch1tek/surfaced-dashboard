// API service for integrating with Python backend that uses archis.py models

import { UrbanReport } from '@/types/urbanReport';
import { convertPythonUrbanReport, convertPythonUrbanReportsArray, isValidUrbanReportData } from '@/utils/dataConverter';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

export class UrbanReportAPI {
  /**
   * Fetch all urban reports from the Python backend
   */
  static async getAllReports(): Promise<UrbanReport[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/urban-reports`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const pythonData = await response.json();
      
      // Validate and convert the data
      if (Array.isArray(pythonData)) {
        const validReports = pythonData.filter(isValidUrbanReportData);
        return convertPythonUrbanReportsArray(validReports);
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch urban reports:', error);
      return [];
    }
  }

  /**
   * Fetch urban reports within a geographical area
   */
  static async getReportsByLocation(
    latitude: number, 
    longitude: number, 
    radiusKm: number = 5
  ): Promise<UrbanReport[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/urban-reports/location?lat=${latitude}&lng=${longitude}&radius=${radiusKm}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const pythonData = await response.json();
      
      if (Array.isArray(pythonData)) {
        const validReports = pythonData.filter(isValidUrbanReportData);
        return convertPythonUrbanReportsArray(validReports);
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch reports by location:', error);
      return [];
    }
  }

  /**
   * Submit a new urban report to the Python backend
   */
  static async submitReport(reportData: any): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/urban-reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, id: result.id };
    } catch (error) {
      console.error('Failed to submit report:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get a single urban report by ID
   */
  static async getReportById(id: string): Promise<UrbanReport | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/urban-reports/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const pythonData = await response.json();
      
      if (isValidUrbanReportData(pythonData)) {
        return convertPythonUrbanReport(pythonData);
      }
      
      return null;
    } catch (error) {
      console.error('Failed to fetch report by ID:', error);
      return null;
    }
  }

  /**
   * Get reports filtered by topics
   */
  static async getReportsByTopics(topics: string[]): Promise<UrbanReport[]> {
    try {
      const topicsQuery = topics.join(',');
      const response = await fetch(
        `${API_BASE_URL}/api/urban-reports/topics?topics=${encodeURIComponent(topicsQuery)}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const pythonData = await response.json();
      
      if (Array.isArray(pythonData)) {
        const validReports = pythonData.filter(isValidUrbanReportData);
        return convertPythonUrbanReportsArray(validReports);
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch reports by topics:', error);
      return [];
    }
  }

  /**
   * Get reports by time range
   */
  static async getReportsByTimeRange(
    startTime: Date, 
    endTime: Date
  ): Promise<UrbanReport[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/urban-reports/time-range?start=${startTime.toISOString()}&end=${endTime.toISOString()}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const pythonData = await response.json();
      
      if (Array.isArray(pythonData)) {
        const validReports = pythonData.filter(isValidUrbanReportData);
        return convertPythonUrbanReportsArray(validReports);
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch reports by time range:', error);
      return [];
    }
  }

  /**
   * WebSocket connection for real-time updates
   */
  static connectWebSocket(onMessage: (report: UrbanReport) => void): WebSocket | null {
    try {
      const wsUrl = API_BASE_URL.replace('http', 'ws') + '/ws/urban-reports';
      const ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const pythonData = JSON.parse(event.data);
          if (isValidUrbanReportData(pythonData)) {
            const report = convertPythonUrbanReport(pythonData);
            onMessage(report);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return ws;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      return null;
    }
  }
}

// Example usage in React component:
/*
import { UrbanReportAPI } from '@/services/urbanReportAPI';

// In your component
useEffect(() => {
  const fetchReports = async () => {
    const reports = await UrbanReportAPI.getAllReports();
    setMapData(reports);
  };
  
  fetchReports();

  // Set up real-time updates
  const ws = UrbanReportAPI.connectWebSocket((newReport) => {
    setMapData(prev => [...prev, newReport]);
  });

  return () => {
    if (ws) {
      ws.close();
    }
  };
}, []);
*/ 
import { GoogleGenerativeAI } from '@google/generative-ai';

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

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  }

  async processLocationQuery(query: string): Promise<GeminiLocationResponse> {
    const prompt = `
You are a helpful assistant that understands natural language queries about locations in Bengaluru, India.

User Query: "${query}"

Please analyze this query and return a JSON response with the following structure:
{
  "locations": [
    {
      "name": "locality/area name",
      "coordinates": {
        "latitude": number,
        "longitude": number
      },
      "description": "brief description of the area",
      "category": "nightlife/residential/commercial/tech/etc",
      "tagline": "funny/witty tagline relevant to the user's query context"
    }
  ],
  "query_type": "party_hubs/restaurants/tech_areas/shopping/etc",
  "search_terms": ["relevant", "search", "terms", "for", "venues"]
}

Guidelines:
- Focus on well-known areas in Bengaluru
- Include accurate coordinates for each location
- For party/nightlife queries, include areas like Koramangala, Indiranagar, Brigade Road, UB City Mall, etc.
- For tech areas, include Whitefield, Electronic City, HSR Layout, etc.
- Limit to EXACTLY 3 most relevant locations
- search_terms should be specific venue types (e.g., ["pubs", "bars", "nightclubs"] for party queries)
- tagline should be funny, witty, and contextual to the user's query (e.g., for party queries: "Drunkard's Paradise", for coffee queries: "Caffeine Central", for tech queries: "Code Monkey Habitat")
- Keep taglines short (3-4 words max) and Bengaluru-specific when possible

Return ONLY the JSON response, no additional text.
`;

    try {
      console.log('📡 Sending request to Gemini API...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('📨 Raw Gemini response:', text);
      
      // Clean up the response to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ No JSON found in Gemini response');
        // Provide fallback response for party hubs query
        if (query.toLowerCase().includes('party') || query.toLowerCase().includes('pub') || query.toLowerCase().includes('bar')) {
          console.log('🔄 Using fallback party hubs response');
          return {
            locations: [
              {
                name: "Koramangala",
                coordinates: { latitude: 12.9352, longitude: 77.6245 },
                description: "Trendy nightlife area with pubs and bars",
                category: "nightlife"
              },
              {
                name: "Indiranagar",
                coordinates: { latitude: 12.9716, longitude: 77.6412 },
                description: "Popular entertainment district",
                category: "nightlife"
              },
              {
                name: "Brigade Road",
                coordinates: { latitude: 12.9716, longitude: 77.6033 },
                description: "Central shopping and nightlife area",
                category: "nightlife"
              }
            ],
            query_type: "party_hubs",
            search_terms: ["pubs", "bars", "nightclub"]
          };
        }
        throw new Error('Invalid JSON response from Gemini');
      }
      
      const jsonResponse = JSON.parse(jsonMatch[0]);
      console.log('✅ Parsed Gemini JSON response:', jsonResponse);
      return jsonResponse as GeminiLocationResponse;
    } catch (error) {
      console.error('❌ Error processing Gemini query:', error);
      throw new Error(`Failed to process location query: ${error.message}`);
    }
  }

  async processGeneralQuery(query: string): Promise<string> {
    const prompt = `
You are a helpful assistant for Bengaluru city information. Answer the following query concisely and helpfully:

Query: "${query}"

Provide a brief, informative response about Bengaluru.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error processing general query:', error);
      throw new Error('Failed to process query');
    }
  }
} 
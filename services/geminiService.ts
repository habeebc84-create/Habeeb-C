import { GoogleGenAI, Type } from "@google/genai";
import { DestinationData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTravelGuide = async (destination: string, origin: string, languageName: string = 'English'): Promise<DestinationData> => {
  const model = "gemini-2.5-flash";

  const prompt = `
    Act as an expert travel guide and historian.
    Create a comprehensive travel guide for a trip from "${origin}" to "${destination}".
    
    IMPORTANT: Provide the content in the "${languageName}" language. 
    However, keep the JSON keys exactly as specified in the schema. Only the values should be in ${languageName}.
    
    Include:
    1. A catchy tagline and a rich but concise description (max 3-4 sentences).
    2. HISTORY: Provide a VERY BRIEF historical snapshot. Max 2-3 sentences total. Focus only on the most significant fact.
    3. TRANSPORTATION ROUTES: You MUST provide at least 2 distinct options:
       - One strictly "Budget" (Affordable) option (e.g., Bus, Economy Train).
       - One "Premium" (Fastest/Comfort) option (e.g., Flight, First Class Train, Private Car).
       - Label the 'category' field strictly as either 'Budget' or 'Premium'.
       - Provide estimated costs in BOTH USD ($) and INR (₹). Example: "$50 / ₹4,100".
    4. HOTELS/ACCOMMODATION: Provide 4 recommendations:
       - 2 "Budget" options (Hostels, Budget Hotels).
       - 2 "Luxury" options (4-5 Star Hotels).
       - Provide rating (e.g., "4.5/5") and price estimate per night in BOTH USD ($) and INR (₹). Example: "$120 / ₹9,900".
    5. COORDINATES: Accurately provide the latitude and longitude for the destination, the origin, and all specific attractions/spots.
    6. Top tourist attractions with their locations. Keep descriptions detailed but concise (2-3 sentences).
    7. Specific "Camera Places" (Photography spots) with tips on angles and locations.
    8. Famous local dishes and a specific place/restaurant to try them with its location.
    9. Practical money-saving travel tips.
    
    The output must be strictly valid JSON matching the schema provided.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            destinationName: { type: Type.STRING },
            tagline: { type: Type.STRING },
            description: { type: Type.STRING },
            history: { type: Type.STRING },
            bestTimeToVisit: { type: Type.STRING },
            currency: { type: Type.STRING },
            coordinates: {
              type: Type.OBJECT,
              properties: {
                lat: { type: Type.NUMBER },
                lng: { type: Type.NUMBER }
              }
            },
            originCoordinates: {
              type: Type.OBJECT,
              properties: {
                lat: { type: Type.NUMBER },
                lng: { type: Type.NUMBER }
              }
            },
            routes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  mode: { type: Type.STRING },
                  category: { type: Type.STRING, enum: ['Budget', 'Premium'] },
                  duration: { type: Type.STRING },
                  costEstimate: { type: Type.STRING },
                  details: { type: Type.STRING },
                }
              }
            },
            hotels: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: { type: Type.STRING, enum: ['Budget', 'Luxury'] },
                  rating: { type: Type.STRING },
                  priceEstimate: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            },
            topAttractions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING },
                  bestTime: { type: Type.STRING },
                  coordinates: {
                    type: Type.OBJECT,
                    properties: {
                      lat: { type: Type.NUMBER },
                      lng: { type: Type.NUMBER }
                    }
                  }
                }
              }
            },
            photographySpots: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  bestAngle: { type: Type.STRING },
                  coordinates: {
                    type: Type.OBJECT,
                    properties: {
                      lat: { type: Type.NUMBER },
                      lng: { type: Type.NUMBER }
                    }
                  }
                }
              }
            },
            culinaryDelights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  bestPlaceToTry: { type: Type.STRING },
                  coordinates: {
                    type: Type.OBJECT,
                    properties: {
                      lat: { type: Type.NUMBER },
                      lng: { type: Type.NUMBER }
                    }
                  }
                }
              }
            },
            travelTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["destinationName", "history", "routes", "hotels", "topAttractions", "photographySpots", "culinaryDelights", "coordinates", "originCoordinates"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("EMPTY_RESPONSE");

    return JSON.parse(text) as DestinationData;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Enhanced Error Classification
    if (error.message?.includes('API key') || error.toString().includes('403')) {
      throw new Error("API_KEY_INVALID");
    } else if (error.toString().includes('Failed to fetch') || error.toString().includes('NetworkError')) {
      throw new Error("NETWORK_ERROR");
    } else if (error.message === "EMPTY_RESPONSE") {
      throw new Error("NO_CONTENT_GENERATED");
    } else if (error.toString().includes('candidate') || error.toString().includes('safety')) {
      throw new Error("SAFETY_BLOCK");
    } else {
      throw new Error("GENERIC_ERROR");
    }
  }
};
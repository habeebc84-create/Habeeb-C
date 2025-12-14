
import { GoogleGenAI, Type } from "@google/genai";
import { DestinationData, SuggestedDestination, Review } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getTrendingDestinations = async (): Promise<SuggestedDestination[]> => {
  const model = "gemini-2.5-flash";
  const today = new Date().toDateString();

  const prompt = `
    Act as a real-time travel trend aggregator.
    Task: Identify 4 trending, affordable travel destinations for ${today} by simulating a scan of 100+ travel articles, blogs, and flight deal websites.
    
    Target Audience: Indian Travelers (Budget Conscious).
    
    Requirements:
    - Destinations must be diverse (mix of international and domestic relative to India).
    - Prices MUST be in Indian Rupees (₹).
    - Provide a short "reason" why it's trending today (e.g. "Flight prices dropped 20%").
    
    Return a JSON array with exactly 4 objects.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "City, Country" },
              price: { type: Type.STRING, description: "Total est. trip cost in ₹" },
              rating: { type: Type.STRING, description: "Rating out of 5.0" },
              reason: { type: Type.STRING, description: "Why it is a deal today" }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as SuggestedDestination[];
  } catch (error) {
    console.error("Failed to fetch trending destinations:", error);
    // Return empty to let frontend handle fallback
    return [];
  }
};

export const getHotelReviews = async (hotelName: string, destination: string): Promise<Review[]> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    Act as a travel review aggregator platform.
    Generate 5 realistic user reviews for the hotel "${hotelName}" in "${destination}".
    
    Requirements:
    - Reviews should sound authentic, with a mix of positive (mostly) and slightly critical feedback to make them realistic.
    - Vary the dates (relative time, e.g., "2 days ago", "1 month ago").
    - Generate realistic user names.
    - Ratings should be between 3.5 and 5.0.
    
    Return a JSON array of objects with the following structure:
    - id: string (unique)
    - author: string (full name)
    - rating: number (1-5)
    - date: string
    - comment: string (2-3 sentences)
    - likes: number (0-50)
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              author: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              date: { type: Type.STRING },
              comment: { type: Type.STRING },
              likes: { type: Type.NUMBER }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as Review[];
  } catch (error) {
    console.error("Failed to fetch hotel reviews:", error);
    return [];
  }
};

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
       - Provide estimated costs primarily in INR (₹). You can include USD ($) in parentheses. Example: "₹4,100 ($50)".
    4. HOTELS/ACCOMMODATION: Provide 4 recommendations:
       - 2 "Budget" options (Hostels, Budget Hotels).
       - 2 "Luxury" options (4-5 Star Hotels).
       - Provide rating (e.g., "4.5/5") and price estimate per night primarily in INR (₹). Example: "₹9,900 ($120)".
       - List 3-4 key amenities for each hotel (e.g., "WiFi", "Pool", "Gym", "Breakfast").
       - **CRITICAL**: Provide precise latitude and longitude coordinates for each hotel.
    5. COORDINATES: Accurately provide the latitude and longitude for the destination, the origin, and all specific attractions/spots.
    6. Top tourist attractions with their locations. Keep descriptions detailed but concise (2-3 sentences).
    7. Specific "Camera Places" (Photography spots) with tips on angles and locations.
    8. CULINARY / DINING: 
       - Act as a deal aggregator searching hundreds of local listings.
       - Provide exactly 6 recommendations: 
         * 2 for "Breakfast"
         * 2 for "Lunch" 
         * 2 for "Dinner"
       - Focus on "Best Affordable" prices. 
       - Include the specific 'priceRange' in INR (₹) (e.g., "₹200-500").
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
                  description: { type: Type.STRING },
                  amenities: { type: Type.ARRAY, items: { type: Type.STRING } },
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
                  priceRange: { type: Type.STRING },
                  category: { type: Type.STRING, enum: ['Breakfast', 'Lunch', 'Dinner'] },
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

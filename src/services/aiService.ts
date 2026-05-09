import { GoogleGenAI, Type } from "@google/genai";
import { Lead, LeadStatus, Listing } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export interface LeadScoreResult {
  score: number;
  status: LeadStatus;
  probability: string;
  summary: string;
  qualificationNotes: string;
}

export async function generateListingDescriptionAI(listing: Listing, currency: string): Promise<string> {
  const prompt = `
    As a luxury real estate copywriter, create a compelling marketing description for the following property.
    Your goal is to highlight luxury details, architectural elegance, and market exclusivity.

    Property Details:
    - Address: \${listing.address}, \${listing.city}, \${listing.state}
    - Price: \${listing.price} \${currency}
    - Stats: \${listing.beds} beds, \${listing.baths} baths, \${listing.sqft} sqft
    - MLS#: \${listing.mlsNumber}
    - Status: \${listing.status}

    Guidelines:
    1. Start with a catchy, sophisticated headline.
    2. Use evocative language emphasizing high-end lifestyle and premium finishes.
    3. Mention market scarcity and the unique value proposition of this specific location.
    4. Keep the total length around 150 words.
    5. Maintain an aspirational and exclusive tone.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    return response.text || "An exquisite residence awaiting its discerning owner. Detailed marketing copy is being finalized.";
  } catch (error) {
    console.error("AI Description Error:", error);
    return "This meticulously curated property represents the pinnacle of luxury living. Contact listing agent for exclusive details.";
  }
}

export async function scoreLeadAI(lead: Lead): Promise<LeadScoreResult> {
  const prompt = `
    As an expert Real Estate AI Analyst, evaluate the following lead and provide a data-driven lead score (0-100), qualification status, probability of closing, and a brief summary of your assessment.

    Lead Details:
    - Name: \${lead.name}
    - Budget: \${lead.budget}
    - Location: \${lead.location}
    - Property Type: \${lead.propertyType}
    - Source: \${lead.source}
    - Urgency: \${lead.urgency}
    - Interest: \${lead.interest}
    - Current AI Status: \${lead.chatbotStatus}
    - Financing: \${lead.financingStatus}

    Consider engagement indicators (urgency, budget alignment with market), financing readiness, and intent.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Lead score from 0 to 100" },
            status: { type: Type.STRING, enum: ["hot", "warm", "cold"], description: "Lead status based on heat" },
            probability: { type: Type.STRING, description: "Closing probability percentage (e.g. '85%')" },
            summary: { type: Type.STRING, description: "One sentence summary for the user" },
            qualificationNotes: { type: Type.STRING, description: "Key reasoning for the score" }
          },
          required: ["score", "status", "probability", "summary", "qualificationNotes"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return result as LeadScoreResult;
  } catch (error) {
    console.error("AI Scoring Error:", error);
    // Fallback logic if AI fails
    return {
      score: parseInt(lead.probability) || 50,
      status: lead.status,
      probability: lead.probability,
      summary: "AI analysis temporarily unavailable. Using legacy metrics.",
      qualificationNotes: "Error during real-time neural processing."
    };
  }
}

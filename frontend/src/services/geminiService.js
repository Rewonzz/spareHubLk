import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyCzmwJUJvrb6nLi6zQ8RBqgvSlb8aEwKRg";
const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_CONTEXT = `You are an AI assistant for SpareHubLk, Sri Lanka's largest vehicle spare parts marketplace.

Your expertise includes:
- Sri Lankan vehicle chassis codes (KSP130, NZE121, NCP91, RZJ120, ZRE142, etc.)
- Japanese Domestic Market (JDM) imports
- Spare parts categories: Braking Systems, Engine & Drivetrain, Electronics, Suspension, Wheels, Lighting, Performance
- Price ranges in LKR (Sri Lankan Rupees)
- Common vehicles in Sri Lanka: Toyota Vitz/Yaris, Axio/Allion, Premio, Nissan Tiida, Honda Civic, Fit, Suzuki Swift, Wagon R

Response guidelines:
- Be concise and helpful
- Provide specific part names and price ranges when relevant
- Use uppercase sparingly for emphasis only
- Focus on spare parts, vehicle maintenance, and automotive topics
- If asked about parts, suggest checking the Shop page for availability
- Mention that users can use the VIN Decoder for exact part matching
- Keep responses under 150 words unless complex explanation needed`;

let model = null;
let chatSession = null;

function getModel() {
  if (!model) {
    model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      }
    });
  }
  return model;
}

function getChatSession() {
  if (!chatSession) {
    chatSession = getModel().startChat({
      history: [
        {
          role: "user",
          parts: [{ text: SYSTEM_CONTEXT }],
        },
        {
          role: "model",
          parts: [{ text: "Hello! I'm your SpareHub assistant. How can I help you find spare parts today?" }],
        },
      ],
    });
  }
  return chatSession;
}

export async function sendMessage(message) {
  try {
    const chat = getChatSession();
    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("API_KEY_INVALID")) {
      throw new Error("API key is invalid. Please check configuration.");
    }
    if (error.message?.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("Rate limit exceeded. Please try again in a moment.");
    }
    throw new Error("Failed to get response. Please try again.");
  }
}

export function resetChat() {
  chatSession = null;
}

export async function identifyPartFromImage(imageFile) {
  try {
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });

    const visionModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.3,
      }
    });

    const prompt = `You are an expert vehicle spare parts identifier for the Sri Lankan market.
Analyze the provided image and identify the spare part.
Respond ONLY in valid JSON format with this exact structure:
{
  "description": "A clear 1-2 sentence description of what this part is and what it does",
  "partName": "Short specific name of the part (e.g., 'Brake Pad', 'Shock Absorber', 'Alternator')",
  "category": "One of: Engine, Braking, Suspension, Electronics, Exterior, Wheels, or Other",
  "vehicleModel": "If you can identify the vehicle model this part belongs to, put it here. Otherwise empty string.",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4"]
}

Rules:
- The keywords array must contain 3-6 relevant search terms including part name, category, vehicle type, and any visible brand names.
- Keep descriptions concise but informative.
- If uncertain about vehicleModel, leave it empty.
- Do NOT include markdown formatting, only raw JSON.`;

    const result = await visionModel.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: imageFile.type,
          data: base64
        }
      }
    ]);

    let text = result.response.text();
    console.log("Raw Gemini response:", text);

    // Strip markdown code fences
    text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    // Try direct parse first
    try {
      return JSON.parse(text);
    } catch (directErr) {
      // Find outermost JSON object by scanning brace depth
      let start = -1;
      let depth = 0;
      let end = -1;
      for (let i = 0; i < text.length; i++) {
        if (text[i] === '{') {
          if (depth === 0) start = i;
          depth++;
        } else if (text[i] === '}') {
          depth--;
          if (depth === 0) {
            end = i;
            break;
          }
        }
      }
      if (start !== -1 && end !== -1) {
        const jsonStr = text.slice(start, end + 1);
        try {
          return JSON.parse(jsonStr);
        } catch (nestedErr) {
          console.error("Failed to parse extracted JSON:", jsonStr);
          throw new Error("Could not parse AI response");
        }
      }
      throw new Error("Could not parse AI response");
    }
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    throw new Error("Failed to identify part from image. Please try again.");
  }
}

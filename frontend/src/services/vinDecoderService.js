import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyCsTcpXj7zmJp48jSW3U31K5QjTI6g89ds";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function decodeVinWithAI(vin) {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.2,
            responseMimeType: "application/json",
        },
    });

    const prompt = `You are an automotive expert. Decode this VIN or chassis number: "${vin}"

Return ONLY a valid JSON object. No markdown, no text before or after.
{"make":"string","model":"string","year":"string","engine":"string","bodyType":"string","transmission":"string","country":"string","description":"string","searchKeywords":["string","string","string"]}

If it is a Sri Lankan chassis prefix (e.g. KSP130, NZE121, NCP91, RZJ120), decode accordingly.
If unknown, provide your best estimate.`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        let jsonStr = text;
        
        // Remove markdown code blocks
        if (text.includes('```')) {
            jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').replace(/```/g, '');
        }

        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("Raw response:", text);
            throw new Error("No JSON found in response");
        }
 
        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error("VIN Decode Error:", error.message);
        throw new Error("AI could not decode this VIN. Please try again.");
    }
}
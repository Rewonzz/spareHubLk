import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyDEx0PlsOivoolqbEFRTwM5Yn3KDuMjYLY";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function analyzePrice(partName, userPrice) {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            maxOutputTokens: 2048,
            temperature: 0.4,
            responseMimeType: "application/json",
        },
    });

    const prompt = `You are a Sri Lankan automotive spare parts market analyst.

Part: "${partName}"
User price: LKR ${userPrice}

Return ONLY a valid JSON object. No markdown, no text before or after.
{"partName":"string","category":"string","marketLow":number,"marketAverage":number,"marketHigh":number,"userPrice":${userPrice},"verdict":"UNDERPRICED|FAIR|OVERPRICED","recommendation":"string","insights":["string","string","string"],"demandLevel":"LOW|MEDIUM|HIGH","commonBrands":["string","string","string"],"tip":"string"}

Rules: All LKR prices realistic for 2024–2025 Sri Lanka. verdict=UNDERPRICED if userPrice<marketLow, OVERPRICED if userPrice>marketHigh, else FAIR.`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        // Try multiple approaches to extract JSON
        let jsonStr = text;
        
        // Remove markdown code blocks if present
        if (text.includes('```json')) {
            jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (text.includes('```')) {
            jsonStr = text.replace(/```\n?/g, '').replace(/```\n?/g, '');
        }
        
        // Find JSON object in text
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("Raw response:", text);
            throw new Error("No JSON in response");
        }

        const parsed = JSON.parse(jsonMatch[0]);

        // Ensure userPrice is set correctly
        parsed.userPrice = userPrice;

        // Recalculate verdict
        if (parsed.marketLow && parsed.marketHigh) {
            if (userPrice < parsed.marketLow) parsed.verdict = "UNDERPRICED";
            else if (userPrice > parsed.marketHigh) parsed.verdict = "OVERPRICED";
            else parsed.verdict = "FAIR";
        }

        return parsed;
    } catch (error) {
        console.error("Market analysis error:", error);
        console.error("Raw response:", error.message);
        throw new Error("AI could not analyze this pricing. Please try again.");
    }
}

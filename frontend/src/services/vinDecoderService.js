import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyCsTcpXj7zmJp48jSW3U31K5QjTI6g89ds";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function decodeVinWithAI(vin) {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            maxOutputTokens: 4096,
            temperature: 0.1,
        },
    });

    const prompt = `You are an automotive expert. Decode this VIN or chassis number: "${vin}"

Rules:
- Return ONLY a valid JSON object
- No markdown, no explanations, no code blocks
- Keep values short and concise (under 50 chars each)
- Year should be a single year or a short range like "1992-1995"
- Description should be under 100 characters
- Use exactly this format:

{"make":"Honda","model":"Civic","year":"1992","engine":"1.5L SOHC","bodyType":"Sedan","transmission":"Manual","country":"Japan","description":"Compact sedan popular in Sri Lanka","searchKeywords":["Honda","Civic","D15B"]}

If it is a Sri Lankan chassis prefix (e.g. KSP130, NZE121, NCP91, RZJ120), decode accordingly.
If unknown, provide your best estimate.`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;

        // Extract text from response using multiple methods
        let text = '';

        // Method 1: Direct text()
        try {
            text = response.text().trim();
        } catch (e) {
            // Method 2: From candidates parts
            try {
                const parts = response.candidates?.[0]?.content?.parts;
                if (parts && parts.length > 0) {
                    text = parts.map(p => p.text || '').join('').trim();
                }
            } catch (e2) {
                // Method 3: From response body
                try {
                    const body = response.toJSON?.() || response;
                    text = JSON.stringify(body);
                } catch (e3) {
                    throw new Error("Could not extract text from AI response");
                }
            }
        }

        if (!text) {
            throw new Error("Empty response from AI");
        }

        console.log("Raw VIN response:", text.substring(0, 500));

        // Remove markdown code blocks
        let jsonStr = text;
        if (text.includes('```')) {
            const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (codeBlockMatch) {
                jsonStr = codeBlockMatch[1].trim();
            } else {
                jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            }
        }

        // Try to find JSON object boundaries
        let firstBrace = jsonStr.indexOf('{');
        let lastBrace = jsonStr.lastIndexOf('}');

        // If no closing brace, the JSON might be truncated - try to fix it
        if (lastBrace === -1 || lastBrace < firstBrace) {
            console.warn("JSON appears truncated, attempting to fix...");
            // Count opening braces and add missing closing ones
            const openCount = (jsonStr.match(/\{/g) || []).length;
            const closeCount = (jsonStr.match(/\}/g) || []).length;
            if (openCount > closeCount) {
                jsonStr += '}'.repeat(openCount - closeCount);
                lastBrace = jsonStr.lastIndexOf('}');
            }
        }

        if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
            console.error("Cannot find valid JSON in response:", text);
            throw new Error("No JSON found in response");
        }

        jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);

        // Try to parse the JSON
        try {
            return JSON.parse(jsonStr);
        } catch (parseError) {
            // If parsing fails, try to fix common JSON issues
            console.warn("Initial JSON parse failed, attempting fixes...");

            // Fix 1: Remove trailing commas before closing braces/brackets
            jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');

            // Fix 2: Ensure the last property has a value (if truncated mid-value)
            // Find the last complete property
            const lastCompleteProp = jsonStr.lastIndexOf('"');
            if (lastCompleteProp > 0) {
                const afterLastQuote = jsonStr.slice(lastCompleteProp + 1);
                // If there's an incomplete property after the last quote
                if (afterLastQuote.includes(':') && !afterLastQuote.includes('"')) {
                    // Truncate to the last complete property and close
                    jsonStr = jsonStr.slice(0, lastCompleteProp + 1) + '"}';
                }
            }

            // Fix 3: Ensure all string values are properly closed
            let fixedStr = '';
            let inString = false;
            let escaped = false;
            for (let i = 0; i < jsonStr.length; i++) {
                const char = jsonStr[i];
                if (escaped) {
                    fixedStr += char;
                    escaped = false;
                    continue;
                }
                if (char === '\\') {
                    fixedStr += char;
                    escaped = true;
                    continue;
                }
                if (char === '"') {
                    inString = !inString;
                }
                fixedStr += char;
            }
            // If we're still in a string at the end, close it
            if (inString) {
                fixedStr += '"';
            }
            jsonStr = fixedStr;

            // Try parsing again
            return JSON.parse(jsonStr);
        }
    } catch (error) {
        console.error("VIN Decode Error:", error.message);
        throw new Error("AI could not decode this VIN. Please try again.");
    }
}

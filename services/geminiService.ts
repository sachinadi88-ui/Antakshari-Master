import { GoogleGenAI, Type } from "@google/genai";
import { Song } from "../types";

export const fetchSongsByLetter = async (letter: string): Promise<Song[]> => {
  // Ensure we are using the environment variable directly as instructed.
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("MISSING_API_KEY");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `List 10 iconic Bollywood songs starting with the letter "${letter}".`,
      config: {
        systemInstruction: "You are a Bollywood music encyclopedia. Provide exactly 10 popular songs for the letter provided. Return a JSON array where each object has 'title', 'movie', and 'lyrics' (2 lines max). Return ONLY the JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              movie: { type: Type.STRING },
              lyrics: { type: Type.STRING },
            },
            required: ["title", "movie", "lyrics"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];

    try {
      return JSON.parse(text.trim());
    } catch (e) {
      const match = text.match(/\[.*\]/s);
      if (match) return JSON.parse(match[0]);
      throw new Error("Format Error: Response was not valid JSON.");
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
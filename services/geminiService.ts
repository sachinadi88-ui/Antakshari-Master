
import { GoogleGenAI, Type } from "@google/genai";
import { Song } from "../types";

export const fetchSongsByLetter = async (letter: string): Promise<Song[]> => {
  // Defensive check for the API key in browser environments
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : (window as any).API_KEY;

  if (!apiKey) {
    throw new Error("API_KEY is not configured in environment variables.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Using gemini-flash-latest for maximum reliability and broader access
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: `Provide a list of 10 popular Bollywood songs starting with the letter "${letter}".`,
      config: {
        systemInstruction: "You are a Bollywood music expert. Provide exactly 10 iconic hit songs for the given letter. Return ONLY a JSON array. Each object in the array MUST have 'title', 'movie', and 'lyrics' (exactly 2 lines). If no songs are found, return [].",
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
      console.warn("Retrying JSON extraction from raw text...");
      const match = text.match(/\[.*\]/s);
      if (match) return JSON.parse(match[0]);
      throw new Error("Failed to parse song data.");
    }
  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    // Extract the most useful error message part
    const errorMessage = error?.message || "Unknown API error";
    throw new Error(errorMessage);
  }
};

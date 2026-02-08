
import { GoogleGenAI, Type } from "@google/genai";
import { Song } from "../types";

export const fetchSongsByLetter = async (letter: string): Promise<Song[]> => {
  try {
    // Ensure we initialize with the injected API key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    // Using gemini-3-flash-preview as it's more widely accessible and faster
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
    if (!text) {
      return [];
    }

    try {
      return JSON.parse(text.trim());
    } catch (e) {
      console.error("JSON Parse Error:", text);
      // Fallback regex for extracted JSON
      const match = text.match(/\[.*\]/s);
      if (match) return JSON.parse(match[0]);
      return [];
    }
  } catch (error: any) {
    // Log the specific error for debugging but throw to let the UI handle it
    console.error("Gemini API Error:", error);
    throw error;
  }
};

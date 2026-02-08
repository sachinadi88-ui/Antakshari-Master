import { GoogleGenAI, Type } from "@google/genai";
import { Song } from "../types";

export const fetchSongsByLetter = async (letter: string): Promise<Song[]> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key must be set when running in a browser");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
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
            propertyOrdering: ["title", "movie", "lyrics"]
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
      throw new Error("Invalid response format from archives.");
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
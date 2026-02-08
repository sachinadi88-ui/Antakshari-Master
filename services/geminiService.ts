
import { GoogleGenAI, Type } from "@google/genai";
import { Song } from "../types";

export const fetchSongsByLetter = async (letter: string): Promise<Song[]> => {
  try {
    // Initializing directly with process.env.API_KEY as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Using Pro for better knowledge retrieval of Bollywood songs
      contents: `Provide a list of 10 popular Bollywood songs starting with the letter "${letter}".`,
      config: {
        systemInstruction: "You are a Bollywood music expert. Your task is to provide exactly 10 iconic hit songs for the given letter. Return ONLY a JSON array. Each object in the array MUST have 'title', 'movie', and 'lyrics' (2 lines of the song's opening or most famous hook). If no songs are found, return an empty array [].",
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
      console.warn("Gemini returned empty text response");
      return [];
    }

    try {
      const parsed = JSON.parse(text.trim());
      return Array.isArray(parsed) ? parsed : [];
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", text);
      // Fallback: try to find JSON block if model ignored mime type
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw parseError;
    }
  } catch (error) {
    console.error("Detailed error in fetchSongsByLetter:", error);
    // Return an empty array so the UI can show its "Not found" state instead of crashing
    return [];
  }
};

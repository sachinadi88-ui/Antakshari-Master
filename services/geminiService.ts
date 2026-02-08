
import { GoogleGenAI, Type } from "@google/genai";
import { Song } from "../types";

const getApiKey = () => {
  try {
    return process.env.API_KEY || '';
  } catch (e) {
    return '';
  }
};

export const fetchSongsByLetter = async (letter: string): Promise<Song[]> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.warn("API Key is missing in process.env.API_KEY");
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `List the top 10 most iconic all-time hit Bollywood songs starting with the letter "${letter}". For each song, provide the song title, the movie name, and exactly two lines of famous lyrics. Format the output as a JSON array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Name of the song" },
              movie: { type: Type.STRING, description: "Name of the Bollywood movie" },
              lyrics: { type: Type.STRING, description: "Two lines of the most iconic lyrics" },
            },
            required: ["title", "movie", "lyrics"],
          },
        },
      },
    });

    const jsonStr = response.text?.trim();
    if (!jsonStr) return [];
    
    return JSON.parse(jsonStr) as Song[];
  } catch (error) {
    console.error("Error fetching songs:", error);
    return [];
  }
};

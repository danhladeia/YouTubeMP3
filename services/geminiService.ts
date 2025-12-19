
import { GoogleGenAI, Type } from "@google/genai";
import { VideoResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const searchVideos = async (query: string): Promise<VideoResult[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for popular YouTube videos matching: "${query}". Return a structured JSON list of 5 real or highly probable video matches including title, channel name, duration (e.g. 3:45), and a simulated ID.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              channel: { type: Type.STRING },
              duration: { type: Type.STRING },
              url: { type: Type.STRING }
            },
            required: ["id", "title", "channel", "duration", "url"]
          }
        },
        tools: [{ googleSearch: {} }]
      }
    });

    const results = JSON.parse(response.text || "[]");
    return results.map((v: any) => ({
      ...v,
      thumbnail: `https://picsum.photos/seed/${v.id}/320/180`
    }));
  } catch (error) {
    console.error("Search failed:", error);
    return [];
  }
};

export const getVideoInfoByUrl = async (url: string): Promise<VideoResult | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract video information for the YouTube URL: ${url}. Return title, channel, and duration in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            channel: { type: Type.STRING },
            duration: { type: Type.STRING }
          },
          required: ["title", "channel", "duration"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    const id = url.split("v=")[1]?.split("&")[0] || Math.random().toString(36).substring(7);
    
    return {
      id,
      title: data.title || "Unknown Title",
      channel: data.channel || "Unknown Channel",
      duration: data.duration || "0:00",
      thumbnail: `https://picsum.photos/seed/${id}/320/180`,
      url
    };
  } catch (error) {
    console.error("Info fetch failed:", error);
    return null;
  }
};

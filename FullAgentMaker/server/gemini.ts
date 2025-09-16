// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

import { GoogleGenAI } from "@google/genai";

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AIResponse {
  content: string;
  success: boolean;
  error?: string;
}

export class GeminiService {
  private model = "gemini-2.5-flash";

  async generateContent(prompt: string, systemInstruction?: string): Promise<AIResponse> {
    try {
      const config = systemInstruction ? {
        systemInstruction,
      } : undefined;

      const response = await ai.models.generateContent({
        model: this.model,
        config,
        contents: prompt,
      });

      return {
        content: response.text || "",
        success: true
      };
    } catch (error: any) {
      console.error("Gemini API error:", error);
      return {
        content: "",
        success: false,
        error: error.message || "Failed to generate content"
      };
    }
  }

  async generateStructuredContent<T>(
    prompt: string, 
    schema: any, 
    systemInstruction?: string
  ): Promise<{ data: T | null; success: boolean; error?: string }> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: schema,
        },
        contents: prompt,
      });

      const rawJson = response.text;
      if (rawJson) {
        const data = JSON.parse(rawJson);
        return { data, success: true };
      } else {
        throw new Error("Empty response from model");
      }
    } catch (error: any) {
      console.error("Gemini structured generation error:", error);
      return {
        data: null,
        success: false,
        error: error.message || "Failed to generate structured content"
      };
    }
  }
}

export const geminiService = new GeminiService();
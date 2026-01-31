
import { GoogleGenAI } from "@google/genai";
import { Message, MessagePart } from "../types";

/**
 * Fetches generated content from Gemini models and calculates cost.
 */
export const getGeminiResponse = async (
  modelId: string,
  history: Message[],
  currentParts: MessagePart[],
  _apiKey?: string 
): Promise<{ text: string; cost: number }> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API_KEY environment variable is not configured.");

    const ai = new GoogleGenAI({ apiKey });
    
    const contents = [
      ...history.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: msg.parts.map(p => {
          if (p.text) return { text: p.text };
          if (p.inlineData) return { 
            inlineData: { 
              mimeType: p.inlineData.mimeType, 
              data: p.inlineData.data 
            } 
          };
          return { text: "" };
        })
      })),
      {
        role: 'user',
        parts: currentParts.map(p => {
          if (p.text) return { text: p.text };
          if (p.inlineData) return { 
            inlineData: { 
              mimeType: p.inlineData.mimeType, 
              data: p.inlineData.data 
            } 
          };
          return { text: "" };
        })
      }
    ];

    const response = await ai.models.generateContent({
      model: modelId,
      contents,
    });

    const text = response.text || "No response generated.";
    
    // Simple cost estimation per 1k tokens
    // Gemini 1.5/3 Flash: ~$0.1/1M tokens total
    // Gemini 1.5/3 Pro: ~$3.5/1M tokens total
    const isPro = modelId.includes('pro');
    const ratePerToken = isPro ? 0.0000035 : 0.0000001; 
    
    const usage = response.usageMetadata;
    const totalTokens = usage?.totalTokenCount || 0;
    const cost = totalTokens * ratePerToken;

    return { text, cost };
  } catch (error: any) {
    console.error("Gemini SDK Generation Error:", error);
    throw new Error(error.message || "Communication with Gemini failed.");
  }
};

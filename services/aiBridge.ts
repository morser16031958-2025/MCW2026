
import { Message, MessagePart } from "../types";
import { getUniversalResponse } from "./openai";
import { getGeminiResponse } from "./gemini";
import { MODELS } from "../constants";

/**
 * Orchestrates sensory pre-processing and final response generation.
 */
export const getUnifiedAIResponse = async (
  modelId: string,
  history: Message[],
  currentParts: MessagePart[],
  apiKey: string
): Promise<{ text: string; cost: number }> => {
  const modelConfig = MODELS.find(m => m.id === modelId);
  const isGoogle = modelConfig?.provider === 'google';

  // Check for complex media that requires pre-processing analysis.
  const complexMediaParts = currentParts.filter(p => 
    p.inlineData && (p.inlineData.mimeType.startsWith('audio/') || p.inlineData.mimeType.startsWith('video/'))
  );

  let preProcessingCost = 0;

  if (complexMediaParts.length > 0) {
    const analysisPrompt: MessagePart[] = [
      { text: "ACT AS SENSORY PROCESSOR. Analyze the attached media. For audio: transcribe precisely. For video: describe visual timeline and text. Output ONLY facts, no chat." },
      ...currentParts
    ];
    
    try {
      // Sensory report always uses Gemini
      const sensoryResult = await getGeminiResponse('gemini-3-flash-preview', [], analysisPrompt, isGoogle ? apiKey : undefined);
      preProcessingCost = sensoryResult.cost;
      
      const augmentedParts: MessagePart[] = currentParts.map(p => {
        if (p.inlineData && (p.inlineData.mimeType.startsWith('audio/') || p.inlineData.mimeType.startsWith('video/'))) {
          return { text: `[SYSTEM SENSORY ANALYSIS]:\n${sensoryResult.text}` };
        }
        return p;
      });

      let finalResult;
      if (isGoogle) {
        finalResult = await getGeminiResponse(modelId, history, augmentedParts, apiKey);
      } else {
        finalResult = await getUniversalResponse(modelId, history, augmentedParts, apiKey);
      }
      return { text: finalResult.text, cost: finalResult.cost + preProcessingCost };
    } catch (e: any) {
      console.warn("[MultiChatWinter] Pre-processing failed, falling back to direct request.", e);
    }
  }

  if (isGoogle) {
    return getGeminiResponse(modelId, history, currentParts, apiKey);
  }
  return getUniversalResponse(modelId, history, currentParts, apiKey);
};

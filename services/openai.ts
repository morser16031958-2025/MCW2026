
import { Message, MessagePart } from "../types";

/**
 * Fetches a response from OpenRouter and calculates cost.
 */
export const getUniversalResponse = async (
  modelId: string,
  history: Message[],
  currentParts: MessagePart[],
  apiKey: string
): Promise<{ text: string; cost: number }> => {
  const cleanKey = (apiKey || "").trim();
  
  if (!cleanKey) {
    throw new Error("OpenRouter API Key is missing. Please update it in your profile.");
  }

  const mapPartToOpenAI = (p: MessagePart) => {
    if (p.text) return { type: 'text', text: p.text };
    if (p.inlineData) {
      return {
        type: 'image_url',
        image_url: { 
          url: `data:${p.inlineData.mimeType};base64,${p.inlineData.data}` 
        }
      };
    }
    return null;
  };

  const messages = history.map(msg => {
    const content = msg.parts.map(mapPartToOpenAI).filter(Boolean);
    if (content.length === 1 && content[0]?.type === 'text') {
      return { role: msg.role === 'model' ? 'assistant' : 'user', content: content[0].text };
    }
    return {
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: content
    };
  });

  const currentContent = currentParts.map(mapPartToOpenAI).filter(Boolean);
  messages.push({
    role: 'user',
    content: currentContent as any
  });

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      credentials: 'omit',
      headers: {
        "Authorization": `Bearer ${cleanKey}`,
        "Content-Type": "application/json",
        "X-Title": "MultiChatWinter"
      },
      body: JSON.stringify({
        model: modelId,
        messages: messages,
        temperature: 0.7,
        top_p: 1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP Error ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    
    if (text === undefined || text === null) throw new Error("AI returned an empty response.");

    // Extracting usage for cost calculation
    // Note: OpenRouter provides usage but prices vary per model. 
    // We'll use a conservative estimate based on the usage metadata if available.
    const usage = data.usage;
    let cost = 0;
    if (usage) {
      // Very rough estimate averages
      const inputRate = modelId.includes('gpt-4o') && !modelId.includes('mini') ? 0.005 : 0.00015;
      const outputRate = modelId.includes('gpt-4o') && !modelId.includes('mini') ? 0.015 : 0.0006;
      cost = ((usage.prompt_tokens / 1000) * inputRate) + ((usage.completion_tokens / 1000) * outputRate);
    }

    return { text, cost };
  } catch (error: any) {
    console.error("OpenRouter Request Error:", error);
    throw error;
  }
};

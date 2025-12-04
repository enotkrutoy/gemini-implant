
import { GoogleGenAI, Chat, Content, Part } from "@google/genai";
import { SYSTEM_INSTRUCTION, ModelType, Message } from "../types";

let chatSession: Chat | null = null;
let currentModel: string | null = null;
let genAI: GoogleGenAI | null = null;

const getGenAI = (): GoogleGenAI => {
  if (!genAI) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY environment variable is not set.");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

// Resolve UI "Auto" selection to a concrete model ID
const resolveModel = (model: string): string => {
  if (model === ModelType.AUTO) {
    return ModelType.FLASH; // Default strategy for Auto is Flash 2.5
  }
  return model;
};

// Helper to convert UI messages to SDK Content format
const mapHistoryToContent = (messages: Message[]): Content[] => {
  return messages
    .filter(msg => msg.id !== 'welcome') // Skip UI-only welcome message
    .map(msg => {
      const parts: Part[] = [];
      
      // Add text part if exists
      if (msg.text) {
        parts.push({ text: msg.text });
      }

      // Add image parts if exist
      if (msg.images && msg.images.length > 0) {
        msg.images.forEach(img => {
          const matches = img.match(/^data:(.+);base64,(.+)$/);
          if (matches) {
            parts.push({
              inlineData: {
                mimeType: matches[1],
                data: matches[2]
              }
            });
          }
        });
      }

      return {
        role: msg.role,
        parts: parts
      };
    })
    .filter(content => content.parts.length > 0); // IMPORTANT: Filter out messages with empty parts to avoid 400 bad request
};

export const initializeChat = (model: string, history: Content[] = []) => {
  const resolvedModel = resolveModel(model);
  const ai = getGenAI();
  chatSession = ai.chats.create({
    model: resolvedModel,
    history: history,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.4,
    },
  });
  currentModel = model; // Store the original selection (including 'auto') to track state
};

export const resetSession = () => {
  chatSession = null;
  currentModel = null;
};

export const sendMessageToGemini = async (
  text: string, 
  imageDataUrls: string[] = [], 
  modelId: string = ModelType.FLASH,
  previousHistory: Message[] = []
): Promise<string> => {
  
  // Re-initialize if the model changed or session doesn't exist, passing along history
  if (!chatSession || currentModel !== modelId) {
    const sdkHistory = mapHistoryToContent(previousHistory);
    initializeChat(modelId, sdkHistory);
  }

  if (!chatSession) {
    throw new Error("Failed to initialize chat session.");
  }

  try {
    const parts: Part[] = [];

    // Add images to the current message
    imageDataUrls.forEach(dataUrl => {
      const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        parts.push({
          inlineData: {
            mimeType: matches[1],
            data: matches[2]
          }
        });
      }
    });

    // Add text to the current message
    if (text) {
      parts.push({ text });
    }

    // Prepare payload. 
    // The SDK expects `message` to be `string | Part[]`. 
    // If we have images, we MUST use Part[].
    const messagePayload = parts.length > 0 ? parts : text;

    const response = await chatSession.sendMessage({
      message: messagePayload
    });

    return response.text || "Ответ не был сгенерирован.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

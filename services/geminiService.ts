import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import { Scene } from "../types";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const scriptParserModel = 'gemini-2.5-flash';
const imageGeneratorModel = 'imagen-4.0-generate-001';
const chatModel = 'gemini-2.5-flash';

export const parseScript = async (script: string): Promise<Omit<Scene, 'id'>[]> => {
  try {
    const response = await ai.models.generateContent({
      model: scriptParserModel,
      contents: `Parse the following film script. Identify each distinct scene or shot and provide a concise visual description for a storyboard panel. Return the result as a JSON array of objects, where each object has a 'description' key containing the visual prompt. Script: \n\n${script}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              description: {
                type: Type.STRING,
                description: 'A concise visual description for a storyboard panel for this scene.',
              },
            },
            required: ['description'],
          },
        },
      },
    });
    
    const jsonString = response.text;
    const parsedScenes = JSON.parse(jsonString);

    if (!Array.isArray(parsedScenes) || !parsedScenes.every(s => typeof s.description === 'string')) {
        throw new Error("Invalid JSON structure received from API.");
    }
    
    return parsedScenes;
  } catch (error) {
    console.error("Error parsing script:", error);
    throw new Error("Failed to parse the script. Please check the script format and try again.");
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
    try {
        const fullPrompt = `A cinematic, high-quality storyboard panel illustration of: ${prompt}. Minimalist, clear action, dramatic lighting.`;
        const response = await ai.models.generateImages({
            model: imageGeneratorModel,
            prompt: fullPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated.");
        }
    } catch(error) {
        console.error("Error generating image:", error);
        let errorContent = '';
        if (typeof error === 'string') {
            errorContent = error;
        } else if (error instanceof Error) {
            errorContent = error.message;
        } else {
            errorContent = JSON.stringify(error);
        }
        
        if (errorContent.includes("429") || errorContent.includes("RESOURCE_EXHAUSTED")) {
            throw new Error("Rate limit exceeded. Your free quota might be exhausted. Please check your plan and billing details.");
        }
        throw new Error("Failed to generate the storyboard image.");
    }
};

export const createChat = (): Chat => {
    return ai.chats.create({
        model: chatModel,
        config: {
            systemInstruction: 'You are a helpful assistant with expertise in filmmaking and scriptwriting. Answer questions concisely and clearly.',
        },
    });
};

export const sendMessage = async (chat: Chat, message: string): Promise<string> => {
    try {
        const result: GenerateContentResponse = await chat.sendMessage({ message });
        return result.text;
    } catch (error) {
        console.error("Error sending chat message:", error);
        throw new Error("Failed to get a response from the chatbot.");
    }
};
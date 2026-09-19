import { GoogleGenAI } from '@google/genai';

async function listModels() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.list();
    console.log("Available Models:");
    console.log(response.models);
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
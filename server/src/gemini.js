import { GoogleGenAI } from '@google/genai';
import { config } from './config.js';

let aiInstance = null;

function getAiClient() {
  if (!aiInstance) {
    if (!config.geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured in server/.env');
    }
    aiInstance = new GoogleGenAI({ apiKey: config.geminiApiKey });
  }
  return aiInstance;
}

/**
 * Generates an assistant response using Google Gemini official SDK.
 * @param {Array<{role: string, content: string}>} history - Up to the last 20 messages
 * @param {string} userMessage - The new incoming user message
 * @returns {Promise<string>} - The assistant reply text
 */
export async function generateGeminiReply(history = [], userMessage) {
  const ai = getAiClient();

  // Map messages to Gemini format: 'assistant' -> 'model', 'user' -> 'user'
  const contents = history.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  // Append latest user message
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  const response = await ai.models.generateContent({
    model: config.geminiModel,
    contents,
  });

  const reply = response.text;
  if (!reply) {
    throw new Error('Received empty response from Gemini');
  }

  return reply;
}

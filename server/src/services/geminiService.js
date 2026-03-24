import { GoogleGenerativeAI } from '@google/generative-ai';
import { addToQueue } from './queueService.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Generates content using the Gemini API, routed through the queue service.
 * @param {string} prompt - The prompt to send to Gemini
 * @param {object} generationConfig - { temperature, topK, topP, maxOutputTokens }
 * @returns {Promise<string>} The generated text
 */
export async function generateContent(prompt, generationConfig) {
  return addToQueue(async () => {
    console.log('[Gemini] Starting generation...');
    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: generationConfig.temperature ?? 0.8,
          topK: generationConfig.topK ?? 40,
          topP: generationConfig.topP ?? 0.95,
          maxOutputTokens: generationConfig.maxOutputTokens ?? 1024,
        },
      });

      const response = result.response;
      const text = response.text();
      console.log(`[Gemini] Generation complete. Chars: ${text.length}`);
      return text;
    } catch (err) {
      console.error('[Gemini] Generation error:', err.message);
      throw new Error(`Gemini API error: ${err.message}`);
    }
  });
}

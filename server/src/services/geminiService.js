import { GoogleGenerativeAI } from '@google/generative-ai';
import { addToQueue } from './queueService.js';
import { generateMockContent } from './mockService.js';

const isMockMode = process.env.USE_MOCK === 'true' || !process.env.GEMINI_API_KEY;

let model;
if (!isMockMode) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
}

const MOCK_CONTEXT_DEFAULTS = {
  contentType: 'blog_post',
  topic: 'AI Content Generation',
  tone: 'professional',
  keywords: [],
  targetAudience: '',
};

/**
 * Generates content using the Gemini API, routed through the queue service.
 * Falls back to mock data when USE_MOCK=true or GEMINI_API_KEY is not set.
 *
 * @param {string} prompt - The prompt to send to Gemini
 * @param {object} generationConfig - { temperature, topK, topP, maxOutputTokens }
 * @param {object} [context] - Optional context used for mock generation
 * @param {string} [context.contentType] - "blog_post" or "social_media"
 * @param {string} [context.topic] - The main topic
 * @param {string} [context.tone] - Desired tone
 * @param {string[]} [context.keywords] - Focus keywords
 * @param {string} [context.targetAudience] - Intended audience
 * @returns {Promise<string>} The generated text
 */
export async function generateContent(prompt, generationConfig, context = {}) {
  if (isMockMode) {
    console.log('[Mock] Returning mock content (USE_MOCK=true or GEMINI_API_KEY not set)');
    const { contentType, topic, tone, keywords, targetAudience } = { ...MOCK_CONTEXT_DEFAULTS, ...context };
    return generateMockContent(contentType, topic, tone, keywords, targetAudience);
  }

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

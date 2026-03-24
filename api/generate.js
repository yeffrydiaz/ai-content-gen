import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildPrompt } from '../server/src/utils/promptBuilder.js';

const VALID_CONTENT_TYPES = ['blog_post', 'social_media'];
const VALID_TONES = ['professional', 'casual', 'friendly', 'authoritative', 'inspirational', 'humorous'];

const allowedOrigin = process.env.CLIENT_ORIGIN || '';

export default async function handler(req, res) {
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { contentType, topic, tone = 'professional', keywords = [], targetAudience = '' } = req.body ?? {};

  if (!contentType || !VALID_CONTENT_TYPES.includes(contentType)) {
    return res.status(400).json({
      success: false,
      error: `Invalid or missing contentType. Must be one of: ${VALID_CONTENT_TYPES.join(', ')}`,
    });
  }

  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'topic is required and must be a non-empty string.' });
  }

  const resolvedTone = VALID_TONES.includes(tone) ? tone : 'professional';
  const resolvedKeywords = Array.isArray(keywords)
    ? keywords.map((k) => String(k).trim()).filter(Boolean)
    : String(keywords).split(',').map((k) => k.trim()).filter(Boolean);

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ success: false, error: 'AI service unavailable. Check your API key configuration.' });
    }

    const { prompt, generationConfig } = buildPrompt(
      contentType,
      topic.trim(),
      resolvedTone,
      resolvedKeywords,
      String(targetAudience).trim()
    );

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: generationConfig.temperature ?? 0.8,
        topK: generationConfig.topK ?? 40,
        topP: generationConfig.topP ?? 0.95,
        maxOutputTokens: generationConfig.maxOutputTokens ?? 1024,
      },
    });

    const generatedText = result.response.text();
    const wordCount = generatedText.trim().split(/\s+/).length;

    return res.json({
      success: true,
      content: generatedText,
      contentType,
      metadata: {
        tone: resolvedTone,
        targetAudience: String(targetAudience).trim() || 'General audience',
        wordCount,
      },
    });
  } catch (err) {
    console.error('[/api/generate] Error:', err.message);

    if (err.message.includes('API_KEY') || err.message.includes('api key')) {
      return res.status(503).json({ success: false, error: 'AI service unavailable. Check your API key configuration.' });
    }

    return res.status(500).json({ success: false, error: err.message || 'Failed to generate content.' });
  }
}

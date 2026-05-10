import { buildPrompt } from '../server/src/utils/promptBuilder.js';

const VALID_CONTENT_TYPES = ['blog_post', 'social_media'];
const VALID_TONES = ['professional', 'casual', 'friendly', 'authoritative', 'inspirational', 'humorous'];
const GEMINI_MODEL = 'gemini-1.5-flash';

function getGeneratedText(payload) {
  return (payload.candidates || [])
    .flatMap((candidate) => candidate.content?.parts || [])
    .map((part) => part.text)
    .filter(Boolean)
    .join('\n')
    .trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed.' });
  }

  const { contentType, topic, tone = 'professional', keywords = [], targetAudience = '' } = req.body || {};

  if (!contentType || !VALID_CONTENT_TYPES.includes(contentType)) {
    return res.status(400).json({
      success: false,
      error: `Invalid or missing contentType. Must be one of: ${VALID_CONTENT_TYPES.join(', ')}`,
    });
  }

  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'topic is required and must be a non-empty string.' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ success: false, error: 'AI service unavailable. Check your API key configuration.' });
  }

  const resolvedTone = VALID_TONES.includes(tone) ? tone : 'professional';
  const resolvedKeywords = Array.isArray(keywords)
    ? keywords.map((keyword) => String(keyword).trim()).filter(Boolean)
    : String(keywords).split(',').map((keyword) => keyword.trim()).filter(Boolean);
  const resolvedTargetAudience = String(targetAudience).trim();

  try {
    const { prompt, generationConfig } = buildPrompt(
      contentType,
      topic.trim(),
      resolvedTone,
      resolvedKeywords,
      resolvedTargetAudience
    );

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: generationConfig.temperature ?? 0.8,
            topK: generationConfig.topK ?? 40,
            topP: generationConfig.topP ?? 0.95,
            maxOutputTokens: generationConfig.maxOutputTokens ?? 1024,
          },
        }),
      }
    );

    const payload = await response.json();

    if (!response.ok || payload.error) {
      return res.status(response.status || 500).json({
        success: false,
        error: payload.error?.message || 'Failed to generate content.',
      });
    }

    const content = getGeneratedText(payload);

    if (!content) {
      return res.status(502).json({ success: false, error: 'AI service returned an empty response.' });
    }

    return res.status(200).json({
      success: true,
      content,
      contentType,
      metadata: {
        tone: resolvedTone,
        targetAudience: resolvedTargetAudience || 'General audience',
        wordCount: content.split(/\s+/).length,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate content.';
    console.error('[Vercel /api/generate] Error:', message);
    return res.status(500).json({
      success: false,
      error: message,
    });
  }
}

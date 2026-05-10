import { buildPrompt } from '../server/src/utils/promptBuilder.js';

const VALID_CONTENT_TYPES = ['blog_post', 'social_media'];
const VALID_TONES = ['professional', 'casual', 'friendly', 'authoritative', 'inspirational', 'humorous'];
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

function extractGeneratedText(payload) {
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

  const { contentType, topic, tone = 'professional', keywords = [], targetAudience = '', geminiApiKey } = req.body || {};

  const resolvedApiKey = (typeof geminiApiKey === 'string' && geminiApiKey.trim())
    ? geminiApiKey.trim()
    : process.env.GEMINI_API_KEY;

  if (!contentType || !VALID_CONTENT_TYPES.includes(contentType)) {
    return res.status(400).json({
      success: false,
      error: `Invalid or missing contentType. Must be one of: ${VALID_CONTENT_TYPES.join(', ')}`,
    });
  }

  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'topic is required and must be a non-empty string.' });
  }

  if (!resolvedApiKey) {
    console.error('[Vercel /api/generate] No Gemini API key available');
    return res.status(503).json({ success: false, error: 'No API key configured. Please provide your own Gemini API key.' });
  }

  const resolvedTone = VALID_TONES.includes(tone) ? tone : 'professional';
  const resolvedKeywords = Array.isArray(keywords)
    ? keywords.map((keyword) => String(keyword).trim()).filter(Boolean)
    : typeof keywords === 'string'
      ? keywords.split(',').map((keyword) => keyword.trim()).filter(Boolean)
      : [];
  const resolvedTargetAudience = typeof targetAudience === 'string' ? targetAudience.trim() : '';

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
          'x-goog-api-key': resolvedApiKey,
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

    if (response.status === 429) {
      const retryMatch = (payload.error?.message || '').match(/retry in ([\d.]+)s/i);
      const retryInfo = retryMatch ? ` Please try again in about ${Math.ceil(parseFloat(retryMatch[1]))} seconds.` : ' Please try again in a moment.';
      return res.status(429).json({
        success: false,
        error: `The AI service is temporarily unavailable due to high demand.${retryInfo}${!geminiApiKey?.trim() ? ' You can also provide your own Gemini API key to use your personal quota.' : ''}`,
      });
    }

    if (!response.ok || payload.error) {
      return res.status(response.status || 500).json({
        success: false,
        error: payload.error?.message || 'Failed to generate content.',
      });
    }

    const content = extractGeneratedText(payload);

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
        wordCount: content.split(/\s+/).filter(Boolean).length,
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

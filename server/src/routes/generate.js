import { Router } from 'express';
import { buildPrompt } from '../utils/promptBuilder.js';
import { generateContent } from '../services/geminiService.js';

const router = Router();

const VALID_CONTENT_TYPES = ['blog_post', 'social_media'];
const VALID_TONES = ['professional', 'casual', 'friendly', 'authoritative', 'inspirational', 'humorous'];

router.post('/generate', async (req, res) => {
  const { contentType, topic, tone = 'professional', keywords = [], targetAudience = '' } = req.body;

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
    const { prompt, generationConfig } = buildPrompt(
      contentType,
      topic.trim(),
      resolvedTone,
      resolvedKeywords,
      String(targetAudience).trim()
    );

    const generatedText = await generateContent(prompt, generationConfig);

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
    console.error('[Route /generate] Error:', err.message);

    const rawMsg = err?.message;
    const errMsg = typeof rawMsg === 'string' ? rawMsg : JSON.stringify(rawMsg ?? err);
    const errMsgLower = errMsg.toLowerCase();

    if (errMsgLower.includes('api_key') || errMsgLower.includes('api key')) {
      return res.status(503).json({ success: false, error: 'AI service unavailable. Check your API key configuration.' });
    }

    return res.status(500).json({ success: false, error: errMsg || 'Failed to generate content.' });
  }
});

export default router;

import { GoogleGenerativeAI } from '@google/generative-ai';

const VALID_CONTENT_TYPES = ['blog_post', 'social_media'];
const VALID_TONES = ['professional', 'casual', 'friendly', 'authoritative', 'inspirational', 'humorous'];

function buildPrompt(contentType, topic, tone, keywords = [], targetAudience = '') {
  const keywordList = keywords.length > 0 ? keywords.join(', ') : 'none specified';
  const audience = targetAudience || 'general audience';

  if (contentType === 'blog_post') {
    return {
      prompt: `You are an expert content writer. Write a comprehensive, engaging blog post with the following specifications:

**Topic:** ${topic}
**Tone:** ${tone} — maintain this tone consistently throughout the entire post
**Target Audience:** ${audience}
**Keywords to incorporate naturally:** ${keywordList}

**Requirements:**
- Write a compelling headline (H1)
- Include an engaging introduction that hooks the reader
- Use clear H2 subheadings to organise sections (at least 4 sections)
- Write in a ${tone} tone that resonates with ${audience}
- Naturally incorporate the keywords: ${keywordList}
- Include a strong conclusion with a clear call-to-action
- Aim for 600–900 words
- Optimise for readability: short paragraphs, active voice, clear transitions
- Add SEO-friendly meta description suggestion at the end (prefixed with "Meta Description:")

Begin writing the blog post now:`,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    };
  }

  if (contentType === 'social_media') {
    return {
      prompt: `You are an expert social media copywriter. Create platform-optimised social media copy with the following specifications:

**Topic:** ${topic}
**Tone:** ${tone} — apply this tone consistently across all platforms
**Target Audience:** ${audience}
**Keywords/Hashtags to include:** ${keywordList}

Create three distinct variations, each clearly labelled:

---
### LinkedIn Post
Write a professional, value-driven post (150–200 words). Include a thought-leadership angle, relevant hashtags (3–5), and a clear call-to-action. Tone: ${tone}.

---
### Twitter/X Post
Write a punchy, attention-grabbing tweet (max 280 characters). Include 2–3 relevant hashtags. Tone: ${tone}.

---
### Instagram Caption
Write an engaging caption (100–150 words) with storytelling elements, emojis where appropriate, and 5–8 relevant hashtags at the end. Tone: ${tone}.

---

Ensure all variations:
- Speak directly to ${audience}
- Naturally incorporate: ${keywordList}
- Maintain a consistent ${tone} voice
- Drive engagement and action

Begin writing the social media copy now:`,
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    };
  }

  throw new Error(`Unsupported content type: ${contentType}`);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

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
    console.error('[API /generate] Error:', err.message);

    if (err.message.includes('API_KEY') || err.message.includes('api key')) {
      return res.status(503).json({ success: false, error: 'AI service unavailable. Check your API key configuration.' });
    }

    return res.status(500).json({ success: false, error: err.message || 'Failed to generate content.' });
  }
}

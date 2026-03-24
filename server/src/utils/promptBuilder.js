/**
 * Builds a context-aware prompt for the Gemini API.
 *
 * @param {string} contentType - "blog_post" or "social_media"
 * @param {string} topic - The main topic
 * @param {string} tone - Desired tone (professional, casual, etc.)
 * @param {string[]} keywords - SEO/focus keywords
 * @param {string} targetAudience - Description of the intended audience
 * @returns {{ prompt: string, generationConfig: object }}
 */
export function buildPrompt(contentType, topic, tone, keywords = [], targetAudience = '') {
  const keywordList = keywords.length > 0 ? keywords.join(', ') : 'none specified';
  const audience = targetAudience || 'general audience';

  if (contentType === 'blog_post') {
    const prompt = `You are an expert content writer. Write a comprehensive, engaging blog post with the following specifications:

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

Begin writing the blog post now:`;

    return {
      prompt,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    };
  }

  if (contentType === 'social_media') {
    const prompt = `You are an expert social media copywriter. Create platform-optimised social media copy with the following specifications:

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

Begin writing the social media copy now:`;

    return {
      prompt,
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

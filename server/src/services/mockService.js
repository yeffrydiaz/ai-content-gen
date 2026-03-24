/**
 * Returns mock AI-generated content for development/testing when no real
 * Gemini API key is available or when USE_MOCK=true is set.
 *
 * @param {string} contentType - "blog_post" or "social_media"
 * @param {string} topic - The main topic
 * @param {string} tone - Desired tone
 * @param {string[]} keywords - Focus keywords
 * @param {string} targetAudience - Intended audience
 * @returns {string} Mock generated text
 */
export function generateMockContent(contentType, topic, tone, keywords = [], targetAudience = '') {
  const audience = targetAudience || 'general audience';
  const keywordList = keywords.length > 0 ? keywords.join(', ') : 'innovation, strategy';

  if (contentType === 'blog_post') {
    return `# The Future of ${topic}: A Comprehensive Guide

**[MOCK DATA – set GEMINI_API_KEY in .env to use real AI generation]**

## Introduction

Welcome to our in-depth exploration of ${topic}. Whether you're a seasoned professional or just getting started, this guide is crafted specifically for ${audience} who want to stay ahead of the curve. With a ${tone} approach, we'll break down everything you need to know.

## Why ${topic} Matters Today

In a rapidly evolving landscape, understanding ${topic} is no longer optional — it's essential. Organisations that embrace this shift are seeing measurable improvements across all key metrics. Topics like ${keywordList} are driving the conversation forward.

## Key Principles to Understand

There are several foundational concepts that underpin success in ${topic}:

- **Clarity of purpose** – Know why you're pursuing this and what outcomes you expect.
- **Consistent execution** – Results come from repeatable, disciplined action.
- **Continuous learning** – The landscape changes; your approach must evolve too.
- **Stakeholder alignment** – Bring ${audience} along on the journey.

## Practical Steps to Get Started

1. **Assess your current state** – Understand where you are before planning where to go.
2. **Define measurable goals** – Tie objectives to specific outcomes.
3. **Build incrementally** – Don't try to do everything at once.
4. **Leverage ${keywordList}** – Use these as guiding themes throughout your work.

## Common Pitfalls and How to Avoid Them

Even the most experienced teams stumble. Here are the most frequent mistakes and how to sidestep them:

- Skipping the research phase
- Ignoring feedback from ${audience}
- Underestimating the time investment
- Failing to communicate progress

## Conclusion

${topic} is a journey, not a destination. By staying curious, maintaining a ${tone} mindset, and keeping ${audience} at the heart of your decisions, you'll be well-positioned for long-term success. Start small, iterate often, and never stop learning.

---

*Meta Description: Discover the essential guide to ${topic} — practical insights, key principles, and actionable steps for ${audience} seeking to leverage ${keywordList}.*`;
  }

  if (contentType === 'social_media') {
    const topicHashtag = `#${topic.replace(/\s+/g, '')}`;

    return `**[MOCK DATA – set GEMINI_API_KEY in .env to use real AI generation]**

---
### LinkedIn Post

${topic} is reshaping the way ${audience} approach their goals. 🚀

In a world driven by ${keywordList}, staying informed isn't just a competitive advantage — it's a necessity. Here's what I've learned after diving deep into this space:

✅ Clarity beats complexity every time
✅ Consistency compounds results
✅ Community accelerates growth

Whether you're just starting out or looking to level up, the principles behind ${topic} are universally applicable.

What's your biggest challenge when it comes to ${topic}? Drop it in the comments — let's learn together.

${topicHashtag} #Innovation #Strategy #Growth #Leadership

---
### Twitter/X Post

${topic} isn't just a trend — it's the new standard. 💡 Here's what ${audience} need to know: focus on ${keywordList} and the rest follows. Thread 👇 ${topicHashtag} #Innovation #Growth

---
### Instagram Caption

✨ Let's talk about ${topic}.

If you're part of the ${audience} community, you already know that the game is changing. Fast. 🔥

The secret? Doubling down on what works: ${keywordList}.

We've been on this journey and the lessons have been invaluable. From early stumbles to breakthrough moments, every step has been worth it.

Swipe to see how you can apply these principles to your own story. 👉

Save this post for when you need a reminder of why you started. ❤️

${topicHashtag} #Inspiration #ContentCreation #Digital #Innovation #Growth #Strategy #Goals`;
  }

  throw new Error(`Unsupported content type: ${contentType}`);
}

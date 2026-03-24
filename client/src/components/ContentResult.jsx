import { useState } from 'react';

export default function ContentResult({ content, contentType, metadata, onClear }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments without clipboard API
      const ta = document.createElement('textarea');
      ta.value = content;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const title = contentType === 'blog_post' ? '📝 Blog Post' : '📣 Social Media Copy';

  return (
    <div className="card result">
      <div className="result__header">
        <span className="result__title">{title}</span>
        <div className="result__actions">
          <button className="btn btn--copy" onClick={handleCopy}>
            {copied ? '✅ Copied!' : '📋 Copy'}
          </button>
          <button className="btn btn--secondary" onClick={onClear}>
            🔄 Clear
          </button>
        </div>
      </div>

      {metadata && (
        <div className="result__meta">
          {metadata.tone && (
            <span className="badge">🎨 {metadata.tone}</span>
          )}
          {metadata.targetAudience && (
            <span className="badge">👥 {metadata.targetAudience}</span>
          )}
          {metadata.wordCount != null && (
            <span className="badge badge--accent">📊 {metadata.wordCount} words</span>
          )}
        </div>
      )}

      {contentType === 'social_media' && (
        <p className="result__note">
          💡 The content below includes platform variations for LinkedIn, Twitter/X, and Instagram.
        </p>
      )}

      <div className="result__content">{content}</div>
    </div>
  );
}

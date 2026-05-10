import { useState } from 'react';

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'humorous', label: 'Humorous' },
];

const STORAGE_KEY = 'gemini_api_key';

export default function ContentForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    contentType: 'blog_post',
    topic: '',
    tone: 'professional',
    targetAudience: '',
    keywords: '',
  });
  const [apiKeyExpanded, setApiKeyExpanded] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem(STORAGE_KEY) || '');

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleApiKeyChange(e) {
    const val = e.target.value;
    setGeminiApiKey(val);
    if (val.trim()) {
      localStorage.setItem(STORAGE_KEY, val.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const keywords = formData.keywords
      ? formData.keywords.split(',').map((k) => k.trim()).filter(Boolean)
      : [];
    onSubmit({ ...formData, keywords, geminiApiKey: geminiApiKey.trim() || undefined });
  }

  return (
    <div className="card">
      <form className="form" onSubmit={handleSubmit}>
        {/* Content Type */}
        <div className="form__group">
          <label className="form__label">Content Type <span className="required">*</span></label>
          <div className="content-type-group">
            <div className="content-type-option">
              <input
                type="radio"
                id="type-blog"
                name="contentType"
                value="blog_post"
                checked={formData.contentType === 'blog_post'}
                onChange={handleChange}
              />
              <label htmlFor="type-blog">📝 Blog Post</label>
            </div>
            <div className="content-type-option">
              <input
                type="radio"
                id="type-social"
                name="contentType"
                value="social_media"
                checked={formData.contentType === 'social_media'}
                onChange={handleChange}
              />
              <label htmlFor="type-social">📣 Social Media Copy</label>
            </div>
          </div>
        </div>

        {/* Topic */}
        <div className="form__group">
          <label className="form__label" htmlFor="topic">
            Topic <span className="required">*</span>
          </label>
          <input
            className="form__input"
            id="topic"
            name="topic"
            type="text"
            placeholder="e.g., 10 Benefits of Remote Work"
            value={formData.topic}
            onChange={handleChange}
            required
          />
        </div>

        {/* Tone */}
        <div className="form__group">
          <label className="form__label" htmlFor="tone">Tone</label>
          <select
            className="form__select"
            id="tone"
            name="tone"
            value={formData.tone}
            onChange={handleChange}
          >
            {TONE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Target Audience */}
        <div className="form__group">
          <label className="form__label" htmlFor="targetAudience">Target Audience</label>
          <input
            className="form__input"
            id="targetAudience"
            name="targetAudience"
            type="text"
            placeholder="e.g., Marketing professionals"
            value={formData.targetAudience}
            onChange={handleChange}
          />
        </div>

        {/* Keywords */}
        <div className="form__group">
          <label className="form__label" htmlFor="keywords">Keywords</label>
          <input
            className="form__input"
            id="keywords"
            name="keywords"
            type="text"
            placeholder="Enter keywords separated by commas"
            value={formData.keywords}
            onChange={handleChange}
          />
        </div>

        {/* API Key */}
        <div className="form__group">
          <button
            type="button"
            className="api-key-toggle"
            onClick={() => setApiKeyExpanded((v) => !v)}
            aria-expanded={apiKeyExpanded}
          >
            <span>🔑 Use your own Gemini API key</span>
            <span className="api-key-toggle__arrow">{apiKeyExpanded ? '▲' : '▼'}</span>
            {geminiApiKey && <span className="api-key-active-badge">Active</span>}
          </button>
          {apiKeyExpanded && (
            <div className="api-key-panel">
              <p className="api-key-hint">
                Enter your own{' '}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="api-key-link"
                >
                  Google AI Studio API key
                </a>{' '}
                to use your personal quota. It is stored only in your browser.
              </p>
              <input
                className="form__input"
                id="geminiApiKey"
                name="geminiApiKey"
                type="password"
                placeholder="AIza…"
                value={geminiApiKey}
                onChange={handleApiKeyChange}
                autoComplete="off"
                spellCheck={false}
              />
              {geminiApiKey && (
                <button
                  type="button"
                  className="btn btn--secondary api-key-clear"
                  onClick={() => { setGeminiApiKey(''); localStorage.removeItem(STORAGE_KEY); }}
                >
                  Remove key
                </button>
              )}
            </div>
          )}
        </div>

        <button type="submit" className="btn btn--primary" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="spinner" />
              Generating…
            </>
          ) : (
            '✨ Generate Content'
          )}
        </button>
      </form>
    </div>
  );
}

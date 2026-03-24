import { useState } from 'react';

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'humorous', label: 'Humorous' },
];

export default function ContentForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    contentType: 'blog_post',
    topic: '',
    tone: 'professional',
    targetAudience: '',
    keywords: '',
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const keywords = formData.keywords
      ? formData.keywords.split(',').map((k) => k.trim()).filter(Boolean)
      : [];
    onSubmit({ ...formData, keywords });
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

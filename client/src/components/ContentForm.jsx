import { useState } from 'react';

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'humorous', label: 'Humorous' },
];

const TOPIC_MAX_LENGTH = 200;
const AUDIENCE_MAX_LENGTH = 100;
const KEYWORDS_MAX_LENGTH = 200;

function validate(formData) {
  const errors = {};
  const topic = formData.topic.trim();

  if (!topic) {
    errors.topic = 'Topic is required.';
  } else if (topic.length < 3) {
    errors.topic = 'Topic must be at least 3 characters.';
  } else if (topic.length > TOPIC_MAX_LENGTH) {
    errors.topic = `Topic must be ${TOPIC_MAX_LENGTH} characters or fewer.`;
  }

  if (formData.targetAudience.trim().length > AUDIENCE_MAX_LENGTH) {
    errors.targetAudience = `Target audience must be ${AUDIENCE_MAX_LENGTH} characters or fewer.`;
  }

  if (formData.keywords.trim().length > KEYWORDS_MAX_LENGTH) {
    errors.keywords = `Keywords must be ${KEYWORDS_MAX_LENGTH} characters or fewer.`;
  }

  return errors;
}

export default function ContentForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    contentType: 'blog_post',
    topic: '',
    tone: 'professional',
    targetAudience: '',
    keywords: '',
  });
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const fieldErrors = validate(formData);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
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
            className={`form__input${errors.topic ? ' form__input--error' : ''}`}
            id="topic"
            name="topic"
            type="text"
            placeholder="e.g., 10 Benefits of Remote Work"
            value={formData.topic}
            onChange={handleChange}
            maxLength={TOPIC_MAX_LENGTH}
            required
          />
          {errors.topic && <span className="form__error">{errors.topic}</span>}
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
            className={`form__input${errors.targetAudience ? ' form__input--error' : ''}`}
            id="targetAudience"
            name="targetAudience"
            type="text"
            placeholder="e.g., Marketing professionals"
            value={formData.targetAudience}
            onChange={handleChange}
            maxLength={AUDIENCE_MAX_LENGTH}
          />
          {errors.targetAudience && <span className="form__error">{errors.targetAudience}</span>}
        </div>

        {/* Keywords */}
        <div className="form__group">
          <label className="form__label" htmlFor="keywords">Keywords</label>
          <input
            className={`form__input${errors.keywords ? ' form__input--error' : ''}`}
            id="keywords"
            name="keywords"
            type="text"
            placeholder="Enter keywords separated by commas"
            value={formData.keywords}
            onChange={handleChange}
            maxLength={KEYWORDS_MAX_LENGTH}
          />
          {errors.keywords && <span className="form__error">{errors.keywords}</span>}
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

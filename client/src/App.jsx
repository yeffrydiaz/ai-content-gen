import { useState } from 'react';
import axios from 'axios';
import Header from './components/Header.jsx';
import ContentForm from './components/ContentForm.jsx';
import ContentResult from './components/ContentResult.jsx';

export default function App() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(formData) {
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const { data } = await axios.post('/api/generate', formData);
      if (data.success) {
        setResult(data);
      } else {
        const errMsg = data.error;
        setError(typeof errMsg === 'string' ? errMsg : 'An unexpected error occurred.');
      }
    } catch (err) {
      const raw = err.response?.data?.error ?? err.response?.data?.message ?? err.message;
      const message = typeof raw === 'string' ? raw : 'Failed to connect to the server. Is the backend running?';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleClear() {
    setResult(null);
    setError('');
  }

  return (
    <div className="app">
      <Header />
      <div className="container">
        <ContentForm onSubmit={handleSubmit} isLoading={isLoading} />

        {error && (
          <div className="alert alert--error" style={{ marginTop: '1.5rem' }}>
            ⚠️ {error}
          </div>
        )}

        {isLoading && (
          <div className="loading-state" style={{ marginTop: '1.5rem' }}>
            <div className="loading-state__spinner" />
            <p>Generating your content with Gemini AI…</p>
          </div>
        )}

        {result && !isLoading && (
          <ContentResult
            content={result.content}
            contentType={result.contentType}
            metadata={result.metadata}
            onClear={handleClear}
          />
        )}
      </div>
    </div>
  );
}

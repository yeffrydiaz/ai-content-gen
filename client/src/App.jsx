import Header from './components/Header.jsx';
import ContentForm from './components/ContentForm.jsx';
import ContentResult from './components/ContentResult.jsx';
import useContentStore from './store/contentStore.js';

export default function App() {
  const { result, isLoading, error, handleSubmit, handleClear } = useContentStore();

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

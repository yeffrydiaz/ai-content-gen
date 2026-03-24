# ✨ AI Content Generator

An AI-powered writing assistant that helps marketers generate blog posts and social media copy using the **Google Gemini API**. Features a robust queuing system for API rate-limit management, context-aware prompts, and consistent tone control.

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React 18 + Vite 6                       |
| Backend  | Node.js / Express                       |
| AI       | Google Gemini 1.5 Flash                 |
| Queuing  | p-queue (concurrency + interval limits) |
| Rate limiting | express-rate-limit                 |

## Project Structure

```
├── client/          # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── ContentForm.jsx
│   │   │   ├── ContentResult.jsx
│   │   │   └── Header.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/          # Node.js/Express backend
│   ├── src/
│   │   ├── index.js
│   │   ├── routes/
│   │   │   └── generate.js
│   │   ├── services/
│   │   │   ├── geminiService.js
│   │   │   └── queueService.js
│   │   └── utils/
│   │       └── promptBuilder.js
│   ├── package.json
│   └── .env.example
└── package.json     # Root — runs both concurrently
```

## Setup

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd ai-content-gen
npm run install:all
```

### 2. Configure the backend

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and set your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
QUEUE_CONCURRENCY=2
QUEUE_INTERVAL=1000
```

> Get a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey).

### 3. Run in development mode

```bash
npm run dev
```

This starts both the backend (port **3001**) and the Vite dev server (port **5173**) concurrently.

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

| Command              | Description                                    |
|----------------------|------------------------------------------------|
| `npm run dev`        | Run frontend + backend concurrently            |
| `npm run client`     | Run frontend only                              |
| `npm run server`     | Run backend only (with nodemon)                |
| `npm run build`      | Build the React frontend for production        |
| `npm run install:all`| Install all dependencies (root + client + server) |

## API

### `POST /api/generate`

Generate blog posts or social media copy.

**Request body:**

```json
{
  "contentType": "blog_post",
  "topic": "10 Benefits of Remote Work",
  "tone": "professional",
  "targetAudience": "Marketing professionals",
  "keywords": ["remote work", "productivity", "work-life balance"]
}
```

| Field           | Required | Values                                                              |
|-----------------|----------|---------------------------------------------------------------------|
| `contentType`   | ✅       | `"blog_post"` or `"social_media"`                                   |
| `topic`         | ✅       | Any string                                                          |
| `tone`          | ❌       | `professional` (default), `casual`, `friendly`, `authoritative`, `inspirational`, `humorous` |
| `targetAudience`| ❌       | String describing the audience                                      |
| `keywords`      | ❌       | Array of strings                                                    |

**Response:**

```json
{
  "success": true,
  "content": "...",
  "contentType": "blog_post",
  "metadata": {
    "tone": "professional",
    "targetAudience": "Marketing professionals",
    "wordCount": 742
  }
}
```

### `GET /health`

Returns `{ "status": "ok", "timestamp": "..." }`.

## Features

- **Blog Post generation** — structured posts with H1/H2 headings, introduction, sections, conclusion, and meta description suggestion
- **Social Media Copy** — three platform variations: LinkedIn, Twitter/X, Instagram
- **Queue management** — `p-queue` limits concurrent Gemini API calls, preventing rate-limit errors
- **Express rate limiting** — IP-based rate limiting on `/api` routes
- **Tone control** — six tone presets applied consistently across all generated content
- **Copy to clipboard** — one-click copy in the result panel
- **Word count** — displayed as a metadata badge on results

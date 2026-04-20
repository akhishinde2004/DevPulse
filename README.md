# DevPulse 🚀

> Developer Activity Dashboard — enter any GitHub username, get a complete activity visualization.

Live URL pattern: `devpulse.vercel.app/akhishinde2004`

---

## Features

- **GitHub Profile** — avatar, bio, followers, repos, account age
- **Commit Activity** — last 30/60/90 day area chart
- **Current & Longest Streaks** — tracked from GitHub events
- **Contribution Heatmap** — full year green-box grid
- **Top Repos** — sorted by stars with language tags
- **Language Breakdown** — interactive donut chart
- **PR & Issue Stats** — merged, open, closed counts
- **Shareable URL** — `devpulse.vercel.app/:username`

---

## Setup

### 1. Clone & Install

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Fill in your GITHUB_TOKEN and MONGODB_URI in .env

# Frontend
cd ../frontend
npm install
```

### 2. Get a GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `read:user`, `repo`, `read:org`
4. Copy token → paste in `backend/.env`

### 3. Run locally

```bash
# Terminal 1 — Backend
cd backend
npm run dev       # runs on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev       # runs on http://localhost:5173
```

Visit `http://localhost:5173` → enter any GitHub username.

---

## Deploy

### Backend → Render

1. Push `backend/` to GitHub
2. Create new Web Service on Render
3. Set environment variables: `GITHUB_TOKEN`, `MONGODB_URI`, `PORT=5000`
4. Build command: `npm install`
5. Start command: `node server.js`

### Frontend → Vercel

1. Push `frontend/` to GitHub
2. Import project on Vercel
3. Add env var: `VITE_API_URL=https://your-render-url.onrender.com/api`
4. Deploy

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + Recharts |
| Backend | Node.js + Express |
| Cache | node-cache (5 min TTL) |
| Database | MongoDB (optional) |
| API | GitHub REST API v3 |
| Deploy | Vercel (FE) + Render (BE) |

---

## Folder Structure

```
devpulse/
├── backend/
│   ├── server.js
│   ├── routes/github.js
│   ├── controllers/githubController.js
│   └── .env.example
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── index.css
        ├── pages/
        │   ├── Home.jsx + Home.css
        │   └── Dashboard.jsx + Dashboard.css
        ├── components/
        │   ├── ProfileCard.jsx
        │   ├── StatsBar.jsx
        │   ├── CommitChart.jsx
        │   ├── Heatmap.jsx
        │   ├── RepoList.jsx
        │   └── LanguageChart.jsx
        └── utils/api.js
```

---

## Notes

- GitHub Events API only returns ~300 events (last ~90 days of activity). For full-year accurate heatmap, upgrade to GitHub GraphQL API with `contributionsCollection`.
- MongoDB caching is optional — the app works fine without it using `node-cache`.
- Rate limit: GitHub API allows 5000 req/hr with a token. Backend caches all responses for 5 minutes.

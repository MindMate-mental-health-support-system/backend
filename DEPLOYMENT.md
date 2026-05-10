### Deployment guide

This document summarizes how to deploy MindMate’s frontend and backend.

---

## 1. Backend (Node/Express)

### 1.1 Environment

Create `BACKEND/.env` with:

- `PORT=5000` (or your preferred port)
- `SUPABASE_URL=...`
- `SUPABASE_KEY=...`
- `SUPABASE_SERVICE_ROLE_KEY=...` (optional, for JWT validation)
- `TED_API_URL=...` (optional)
- `SED_API_URL=...` (optional)
- `AI_PROVIDER=gemini` (or `ollama`, `openai`)
- `GEMINI_API_KEY=your-gemini-key`
- `AI_MODEL=gemini-2.5-flash` (or desired model)

### 1.2 Production server

1. Install dependencies:
   ```bash
   cd BACKEND
   npm install
   ```
2. Start with a process manager (example with PM2):
   ```bash
   pm2 start server.js --name mindmate-backend
   ```
3. Put the backend behind HTTPS using a reverse proxy (e.g. nginx or Caddy).
   - Configure CORS in `server.js` to allow your frontend origin (e.g. `https://app.yourdomain.com`).

---

## 2. Frontend (React)

### 2.1 Environment

In `FRONTEND_V2`, create a `.env` file:

```bash
REACT_APP_API_BASE_URL=https://api.yourdomain.com
```

This is consumed by `FRONTEND_V2/src/config.js` (`API_BASE_URL`).

### 2.2 Build & host

1. Install dependencies:
   ```bash
   cd FRONTEND_V2
   npm install
   ```
2. Build:
   ```bash
   npm run build
   ```
3. Serve the `build` directory with any static hosting:
   - nginx
   - Vercel / Netlify
   - S3 + CloudFront

Make sure the backend URL in `REACT_APP_API_BASE_URL` matches your deployed backend.

---

## 3. Checklist

- [ ] Supabase project created, tables and RLS in place (see `SUPABASE_SETUP.md`).
- [ ] Backend `.env` configured with Supabase + AI keys.
- [ ] Frontend `.env` configured with `REACT_APP_API_BASE_URL`.
- [ ] Backend running behind HTTPS with CORS restricted to your frontend domain.
- [ ] Frontend built and deployed to a public URL.


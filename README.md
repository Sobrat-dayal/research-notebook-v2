# Research Notebook — Version 2

A research workspace for importing papers, generating source-grounded Gemini summaries, discussing findings, saving notes, and creating editable presentations.

**Live app:** https://research-notebook-v2-sobrat.sobratdayal2008.chatgpt.site

## Features

- PDF, text and arXiv imports (arXiv imports include the abstract; upload a PDF for full text).
- Summaries, supporting excerpts, chat, explanations, charts and notes.
- Presentations with three themes, speaker notes and previous-version restoration.
- PowerPoint, Word, BibTeX, JSON and browser PDF exports.
- Private notebooks, account recovery, responsive layouts and dark mode.

## Run locally

Requires Node.js 22 or newer and npm.

1. Run `npm ci`.
2. Create an ignored `.dev.vars` file in the project root:

   ```dotenv
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_MODEL=gemini-3.5-flash-lite
   ```

3. Run `npm run db:local` to apply local database migrations.
4. Run `npm run dev`.
5. Open http://127.0.0.1:5173 and create an account.

Local storage and accounts are separate from the live site. Never commit `.dev.vars`, API keys, local database files or browser sessions. Gemini generation is subject to your Google account's quota.

## Checks and build

- `npm run lint` — TypeScript checks.
- `npm run build` — browser assets and Cloudflare-compatible Worker.
- `npm test` — run while the local development servers are running.
- Optional live tests use `LIVE_AI=1`, `LIVE_SOURCES=1` and `LIVE_DECK=1` in your shell environment and consume Gemini quota.

## Project layout

The active app is `src/v2/`, mounted by `src/main.tsx`. The backend is `worker/`, shared validation is in `shared/`, and D1 migrations are in `drizzle/`. Notebooks use D1 metadata and R2 document storage.

Earlier AI Studio files remain for reference. The older `src/App.tsx`, `server.ts` and Firebase components are not entry points for Version 2.

## Hosting

The working application is hosted on Sites. GitHub stores its source; GitHub Pages alone cannot run this application's Worker, D1 and R2 backend. A GitHub push does not automatically redeploy the live site. Runtime secrets are configured separately on the hosting service.

See `STEP-8.md` and `STEP-9.md` for verification notes and limitations.

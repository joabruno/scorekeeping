# Scorekeeping - EM 2024 Betting Rules

A simple React app displaying betting rules for the EM 2024 competition.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Build

```bash
npm run build
```

Builds the app for production to the `dist` folder.

## Admin-only pages (without login)

The `Join` and `Tournament` pages are hidden unless admin mode is unlocked.

1. Copy `.env.example` to `.env`
2. Set `VITE_ADMIN_KEY` to your own secret value
3. Long-press `Betting App` in the top navigation for about 1 second
4. Enter the key in the admin modal to unlock admin mode

Admin mode is stored in `sessionStorage`, so it resets when the browser tab/session is closed.

## Deployment

### Option 1: Automatic Deployment (Recommended)

The app automatically deploys to GitHub Pages when you push to the `main` branch. GitHub Actions will:
1. Install dependencies
2. Build the React app
3. Deploy to `https://joabruno.github.io/scorekeeping/`

**First time setup:**
- Go to repository Settings → Pages
- Under "Source", select `Deploy from a branch`
- Choose `gh-pages` branch and `/root` folder
- (GitHub Actions will create this branch automatically)

### Option 2: Manual Deployment

If you want to deploy manually:

```bash
npm run deploy
```

This builds and pushes the `dist` folder to the `gh-pages` branch (requires `gh-pages` package).

## Features

- 📱 Responsive design
- 🎨 Beautiful UI with gradient background
- 📝 Markdown-based rules rendering
- ⚡ Built with Vite (fast builds)
- 🚀 Single Page App (SPA)

## Files

- `rules.md` - The betting rules in Markdown format
- `src/` - React components
- `vite.config.js` - Vite configuration with GitHub Pages base path
- `.github/workflows/deploy.yml` - GitHub Actions deployment workflow

## Tech Stack

- React 18
- Vite 5
- markdown-it for rendering
- CSS3 for styling

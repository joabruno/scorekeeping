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

## Deployment

### Option 1: Automatic Deployment (Recommended)

The app automatically deploys to GitHub Pages when you push to the `main` branch. GitHub Actions will:
1. Install dependencies
2. Build the React app
3. Deploy to `https://nicolai-strudsholm.github.io/scorekeeping/`

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

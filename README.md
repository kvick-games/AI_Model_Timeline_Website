<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Model Release Timeline

This is a Vite + React app that renders a shareable timeline of major AI model releases.

## Local development

1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`

## GitHub Pages deployment

This repo now includes a GitHub Actions workflow that builds the Vite app and deploys the `dist` output to GitHub Pages.

1. Push the repo to GitHub.
2. In GitHub, open `Settings` -> `Pages`.
3. Set the source to `GitHub Actions`.
4. Push to `main` or run the `Deploy GitHub Pages` workflow manually.

The Vite config is set up so repository Pages deployments use the correct base path automatically.

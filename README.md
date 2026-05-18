# AI Model Release Timeline

![AI Model Release Timeline screenshot](./timelineScreenshot_4_1_2026.png)

A shareable web app that maps major AI foundation model releases, coding harnesses, creative systems, events, and robotics milestones across providers onto one chronological timeline.

Live site: https://kvick-games.github.io/AI_Model_Timeline_Website/

## Overview

The app presents model launches on a single horizontal timeline so you can compare release cadence across companies and product lines at a glance. It includes:

- company rows that expand into compact product-line lanes when multiple selected lines are active
- product-line filters for frontier LLMs, open-source LLMs, coding harnesses, events, image generation, video generation, 3D generation, and robotics
- month and year guides across the full timeline, with room for earlier 2020s milestones
- zoom controls for dense sections of the chart
- gap labels showing the number of days between releases
- optional multi-day event ranges for livestreams, conferences, and other events that span more than one date
- a live "Today" marker to show time since the latest release

## Tech stack

- React 19
- Vite
- Tailwind CSS
- Motion
- TypeScript

## Local development

1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`
3. Build for production: `npm run build`

## GitHub Pages deployment

This repo includes a GitHub Actions workflow that builds the Vite app and publishes the `dist` output to GitHub Pages.

1. Push the repo to GitHub.
2. In GitHub, open `Settings` -> `Pages`.
3. Set the source to `GitHub Actions`.
4. Push to `main` or run the `Deploy GitHub Pages` workflow manually.

The Vite config is set up so repository Pages deployments use the correct base path automatically.

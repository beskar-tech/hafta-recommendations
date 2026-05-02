# Hafta Recommendations

A browsable archive of recommendations mentioned on Newslaundry Hafta, organized as cards, episode timelines, and a panelists directory.

Live site: [https://hafta.beskar.tech](https://hafta.beskar.tech)

## What It Does

- Browse recommendations as visual cards.
- Switch to an episodes view grouped by Hafta number.
- Explore a dedicated panelists directory with larger profile modals.
- Filter by search query, panelist, episode, and recommendation type.
- Share filtered views with URL-based state such as `/episodes?episode=586` or `/panelists?panellist=Abhinandan+Sekhri`.

## Screenshots

Add screenshots here once you capture them. Suggested set:

- Cards view
- Episodes view
- Panelists directory
- Panelist modal

Example format:

```md
![Cards view](./docs/screenshots/cards.png)
![Episodes view](./docs/screenshots/episodes.png)
```

## Data Sources

- The app tries to load the live public Hafta recommendations Google Sheet first.
- If the live fetch fails, it falls back to the bundled local snapshot in the repo.
- Episode watch links are resolved from `nl-hafta-urls.txt`.

## Local Assets

### Panelist Portraits

Panelist portraits live in `public/panellists/`.

Supported filename pattern:

- `first-last.png`
- `first-last.jpg`
- `first-last.jpeg`
- `first-last.webp`

If a portrait is missing, the UI falls back to a text/avatar treatment instead of fetching remote images.

### Recommendation Thumbnails

Recommendation thumbnails can be prefetched into `public/recommendations/images/`, with lookup metadata stored in `public/recommendations/manifest.json`.

Generate or refresh the cache with:

```bash
npm run fetch:recommendation-images
```

## Tech Stack

- React
- Vite
- JSZip

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Project Structure

- `index.html` is the Vite entry HTML.
- `src/main.jsx` boots the React app.
- `src/app.jsx` contains the main screen, routing state, filters, and views.
- `src/data.js` loads and normalizes recommendation data.
- `src/routes.js` resolves outbound links for books, films, episodes, and more.
- `src/panellists.js` stores local panelist metadata.
- `public/panellists/` stores local panelist portraits.
- `public/recommendations/` stores prefetched thumbnail assets.

## Notes

- The app is a client-side React app with lightweight path handling for `/`, `/episodes`, and `/panelists`.
- URL query parameters are part of the browsing model and are intentionally shareable.
- Legacy extraction artifacts may still exist in the repo, but the active app runs from the Vite entry and `src/`.

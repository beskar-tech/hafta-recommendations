# Hafta Recommendations

This project is now a standard React + Vite app for browsing Hafta recommendations.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Prefetch recommendation images

```bash
npm run fetch:recommendation-images
```

This downloads recommendation thumbnails into `public/recommendations/images/` and writes `public/recommendations/manifest.json`. The app uses those local files first.

## Structure

- `index.html` is the Vite HTML entry.
- `src/main.jsx` bootstraps React.
- `src/app.jsx` contains the main screen and filtering logic.
- `src/data.js` loads the bundled snapshot and the live spreadsheet fallback.
- `public/panellists/` stores local panelist portraits using `first-last.png`, `first-last.jpg`, `first-last.jpeg`, or `first-last.webp`.
- `public/recommendations/` stores prefetched local recommendation thumbnails.

## Notes

- The app still tries to load the public Google Sheet first, then falls back to the bundled dataset.
- Legacy extraction artifacts are still present in the repo, but the app now runs only from the Vite entry and `src/`.

import episodeUrlList from "../nl-hafta-urls.txt?raw";

const enc = encodeURIComponent;

const HOST_LABELS = {
  "amazon.in": "Amazon",
  "amazon.com": "Amazon",
  "apple.com": "Apple",
  "goodreads.com": "Goodreads",
  "imdb.com": "IMDb",
  "indianexpress.com": "Indian Express",
  "newslaundry.com": "Newslaundry",
  "npr.org": "NPR",
  "nytimes.com": "New York Times",
  "open.spotify.com": "Spotify",
  "penguin.co.in": "Penguin",
  "psyche.co": "Psyche",
  "theatlantic.com": "The Atlantic",
  "theguardian.com": "Guardian",
  "thehindu.com": "The Hindu",
  "theprint.in": "The Print",
  "warontherocks.com": "War on the Rocks",
  "wikipedia.org": "Wikipedia",
  "youtu.be": "YouTube",
  "youtube.com": "YouTube",
};

function buildEpisodeUrlMap() {
  const map = new Map();
  const lines = episodeUrlList
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  lines.forEach((url) => {
    const numericMatch = url.match(/\/hafta-(\d+)\b/i);
    if (numericMatch) {
      map.set(numericMatch[1], url);
    }

    const subscriberMatch = url.match(/\/nl-hafta-subscribers-take-ep-(\d+)\b/i);
    if (subscriberMatch) {
      const episodeNumber = subscriberMatch[1].padStart(2, "0");
      map.set(`Subscriber's Take ${episodeNumber}`, url);
    }
  });

  return map;
}

const EPISODE_URLS = buildEpisodeUrlMap();

function hostLabel(url) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
    if (HOST_LABELS[hostname]) return HOST_LABELS[hostname];
    const parts = hostname.split(".");
    const core = parts.length > 1 ? parts[parts.length - 2] : parts[0];
    return core.replace(/[-_]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
  } catch (_) {
    return "Open Link";
  }
}

export function buildRoutes(title, type, siteHint, sourceUrl, sourceLabel) {
  const t = (type || "").toLowerCase();
  const q = enc(title);
  if (sourceUrl) {
    return {
      primary: { label: sourceLabel || hostLabel(sourceUrl), url: sourceUrl },
      secondary: [
        { label: "GOOGLE", url: `https://www.google.com/search?q=${q}` },
        { label: "NEWS", url: `https://news.google.com/search?q=${q}` },
      ],
    };
  }

  switch (t) {
    case "book":
      return {
        primary: { label: "GOODREADS", url: `https://www.goodreads.com/search?q=${q}` },
        secondary: [
          { label: "AMAZON", url: `https://www.amazon.in/s?k=${q}&i=stripbooks` },
          { label: "GOOGLE", url: `https://www.google.com/search?q=${q}+book` },
        ],
      };
    case "film":
    case "tvseries":
    case "tv":
    case "series":
      return {
        primary: { label: "IMDB", url: `https://www.imdb.com/find/?q=${q}&s=tt` },
        secondary: [
          { label: "YOUTUBE", url: `https://www.youtube.com/results?search_query=${q}+trailer` },
          { label: "GOOGLE", url: `https://www.google.com/search?q=${q}` },
        ],
      };
    case "podcast":
      return {
        primary: { label: "APPLE", url: `https://podcasts.apple.com/in/search?term=${q}` },
        secondary: [
          { label: "SPOTIFY", url: `https://open.spotify.com/search/${q}/podcasts` },
          { label: "YOUTUBE", url: `https://www.youtube.com/results?search_query=${q}+podcast` },
        ],
      };
    case "video":
      return {
        primary: { label: "YOUTUBE", url: `https://www.youtube.com/results?search_query=${q}` },
        secondary: [
          { label: "GOOGLE", url: `https://www.google.com/search?q=${q}` },
          { label: "WIKIPEDIA", url: `https://en.wikipedia.org/w/index.php?search=${q}` },
        ],
      };
    case "music":
      return {
        primary: { label: "SPOTIFY", url: `https://open.spotify.com/search/${q}` },
        secondary: [
          { label: "YOUTUBE", url: `https://www.youtube.com/results?search_query=${q}` },
          { label: "APPLE MUSIC", url: `https://music.apple.com/in/search?term=${q}` },
        ],
      };
    case "article": {
      const primaryUrl = siteHint
        ? `https://www.google.com/search?q=site:${enc(siteHint)}+${q}`
        : `https://news.google.com/search?q=${q}`;
      return {
        primary: { label: siteHint ? `SEARCH ${siteHint.toUpperCase()}` : "GOOGLE NEWS", url: primaryUrl },
        secondary: [
          { label: "GOOGLE", url: `https://www.google.com/search?q=${q}` },
          { label: "NEWS", url: `https://news.google.com/search?q=${q}` },
        ],
      };
    }
    case "report":
      return {
        primary: { label: "GOOGLE PDF", url: `https://www.google.com/search?q=${q}+filetype:pdf` },
        secondary: [
          { label: "SCHOLAR", url: `https://scholar.google.com/scholar?q=${q}` },
          { label: "GOOGLE", url: `https://www.google.com/search?q=${q}` },
        ],
      };
    case "person":
      return {
        primary: { label: "WIKIPEDIA", url: `https://en.wikipedia.org/w/index.php?search=${q}` },
        secondary: [
          { label: "GOOGLE", url: `https://www.google.com/search?q=${q}` },
          { label: "NEWS", url: `https://news.google.com/search?q=${q}` },
        ],
      };
    default:
      return {
        primary: { label: "GOOGLE", url: `https://www.google.com/search?q=${q}` },
        secondary: [
          { label: "NEWS", url: `https://news.google.com/search?q=${q}` },
          { label: "WIKIPEDIA", url: `https://en.wikipedia.org/w/index.php?search=${q}` },
        ],
      };
  }
}

export function newslaundryEpisodeUrl(episode) {
  const key = typeof episode === "number" ? String(episode) : String(episode || "").trim();
  if (EPISODE_URLS.has(key)) {
    return EPISODE_URLS.get(key);
  }

  if (typeof episode === "number") {
    return `https://www.newslaundry.com/search?q=hafta+${episode}`;
  }
  return `https://www.newslaundry.com/search?q=${enc(episode)}`;
}

export function typeLabel(t) {
  const map = {
    article: "Article",
    book: "Book",
    film: "Film",
    tvseries: "TV / Series",
    podcast: "Podcast",
    video: "Video",
    music: "Music",
    report: "Report",
    person: "Person",
  };
  return map[t] || t;
}

import { recommendationImageKey } from "./image-paths";

// Shared utilities + image fetching
function hash(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

const AVATAR_PALETTE = [
  { bg: "#E8332E", fg: "#FFFFFF" },
  { bg: "#A8211E", fg: "#FFFFFF" },
  { bg: "#7A1A18", fg: "#FFFFFF" },
  { bg: "#C2553D", fg: "#FFFFFF" },
  { bg: "#8B5A3C", fg: "#FFFFFF" },
  { bg: "#5C3A28", fg: "#FFFFFF" },
  { bg: "#2A2A2A", fg: "#FFFFFF" },
  { bg: "#3D3530", fg: "#FFFFFF" },
  { bg: "#FAF7F2", fg: "#1A1A1A" },
  { bg: "#D4B896", fg: "#1A1A1A" },
  { bg: "#9C6B4F", fg: "#FFFFFF" },
  { bg: "#6B4226", fg: "#FFFFFF" },
];

function avatarColor(name) {
  const h = hash(name || "");
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

function initials(name) {
  if (!name) return "·";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function norm(s) {
  return (s || "").toString().toLowerCase();
}

function episodeKey(e) {
  return typeof e === "number" ? String(e) : e;
}

function episodeLabel(e) {
  return typeof e === "number" ? `Hafta ${e}` : e;
}

function episodeShort(e) {
  return typeof e === "number" ? `#${e}` : e;
}

function highlight(text, query) {
  if (!query || !query.trim()) return [{ text, hit: false }];
  const q = query.trim().toLowerCase();
  const t = text || "";
  const lower = t.toLowerCase();
  const out = [];
  let i = 0;
  while (i < t.length) {
    const idx = lower.indexOf(q, i);
    if (idx === -1) {
      out.push({ text: t.slice(i), hit: false });
      break;
    }
    if (idx > i) out.push({ text: t.slice(i, idx), hit: false });
    out.push({ text: t.slice(idx, idx + q.length), hit: true });
    i = idx + q.length;
  }
  return out;
}

const memCache = new Map();
const PANELLIST_IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];
let recommendationManifestPromise = null;

function cacheGet(key) {
  if (memCache.has(key)) return memCache.get(key);
  try {
    const v = localStorage.getItem(key);
    if (v !== null) {
      memCache.set(key, v);
      return v;
    }
  } catch (_) {}
  return undefined;
}

function cacheSet(key, val) {
  memCache.set(key, val);
  try {
    localStorage.setItem(key, val == null ? "" : val);
  } catch (_) {}
}

function cleanTitle(title, type) {
  let t = title || "";
  t = t.replace(/\s+by\s+[^,]+$/i, "");
  t = t.replace(/[,:]?\s*(final\s+)?season\s+\d+\b.*/i, "");
  t = t.replace(/\s*\(\d{4}\)\s*$/, "");
  t = t.replace(/\s+[—–-]\s+.+$/, "");
  if (type !== "tvseries") t = t.replace(/:\s+.+$/, "");
  return t.trim();
}

function panellistImageBaseName(name) {
  return (name || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function fetchLocalPanellistImage(name) {
  const baseName = panellistImageBaseName(name);
  if (!baseName) return null;

  const key = `img:local-panellist:${baseName}`;
  const cached = cacheGet(key);
  if (cached && cached !== "") return cached;

  for (const ext of PANELLIST_IMAGE_EXTENSIONS) {
    const src = `/panellists/${baseName}.${ext}`;
    const found = await loadImage(src);
    if (found) {
      cacheSet(key, found);
      return found;
    }
  }

  return null;
}

async function fetchWikiThumb(query) {
  const key = `img:wiki:${query}`;
  const cached = cacheGet(key);
  if (cached !== undefined) return cached || null;
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query.replace(/ /g, "_"))}`;
    const r = await fetch(url, { headers: { Accept: "application/json" } });
    if (!r.ok) {
      cacheSet(key, "");
      return null;
    }
    const j = await r.json();
    const img = (j.thumbnail && j.thumbnail.source) || (j.originalimage && j.originalimage.source);
    cacheSet(key, img || "");
    return img || null;
  } catch (_) {
    cacheSet(key, "");
    return null;
  }
}

async function fetchWikiSearchThumb(query) {
  const key = `img:wikis:${query}`;
  const cached = cacheGet(key);
  if (cached !== undefined) return cached || null;
  try {
    const sUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}&srlimit=1&origin=*`;
    const sr = await fetch(sUrl);
    if (!sr.ok) {
      cacheSet(key, "");
      return null;
    }
    const sj = await sr.json();
    const hit = sj.query && sj.query.search && sj.query.search[0];
    if (!hit) {
      cacheSet(key, "");
      return null;
    }
    const t = await fetchWikiThumb(hit.title);
    cacheSet(key, t || "");
    return t || null;
  } catch (_) {
    cacheSet(key, "");
    return null;
  }
}

async function fetchOpenLibraryCover(title) {
  const key = `img:ol:${title}`;
  const cached = cacheGet(key);
  if (cached !== undefined) return cached || null;
  try {
    const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=1`;
    const r = await fetch(url);
    if (!r.ok) {
      cacheSet(key, "");
      return null;
    }
    const j = await r.json();
    const doc = j.docs && j.docs[0];
    if (doc && doc.cover_i) {
      const img = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
      cacheSet(key, img);
      return img;
    }
    cacheSet(key, "");
    return null;
  } catch (_) {
    cacheSet(key, "");
    return null;
  }
}

async function loadRecommendationManifest() {
  if (!recommendationManifestPromise) {
    recommendationManifestPromise = fetch("/recommendations/manifest.json", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : {}))
      .catch(() => ({}));
  }
  return recommendationManifestPromise;
}

async function fetchLocalRecommendationImage(title, type) {
  const key = recommendationImageKey(title, type);
  const manifest = await loadRecommendationManifest();
  const fileName = manifest[key];
  if (!fileName) return null;
  return `/recommendations/images/${fileName}`;
}

async function fetchThumbnailFor(title, type) {
  const local = await fetchLocalRecommendationImage(title, type);
  if (local) return local;

  const cleaned = cleanTitle(title, type);
  if (!cleaned) return null;

  if (type === "book") {
    const ol = await fetchOpenLibraryCover(cleaned);
    if (ol) return ol;
    return fetchWikiSearchThumb(`${cleaned} novel`);
  }
  if (type === "film") {
    return fetchWikiSearchThumb(`${cleaned} film`);
  }
  if (type === "tvseries" || type === "tv" || type === "series") {
    return fetchWikiSearchThumb(`${cleaned} TV series`);
  }
  if (type === "person") {
    return fetchWikiSearchThumb(cleaned);
  }
  if (type === "podcast") {
    return fetchWikiSearchThumb(`${cleaned} podcast`);
  }
  if (type === "music") {
    return fetchWikiSearchThumb(`${cleaned} album`);
  }
  return null;
}

async function fetchPersonImage(name) {
  return fetchLocalPanellistImage(name);
}

export const HU = {
  hash,
  avatarColor,
  initials,
  norm,
  episodeKey,
  episodeLabel,
  episodeShort,
  highlight,
  fetchThumbnailFor,
  fetchPersonImage,
  cleanTitle,
};

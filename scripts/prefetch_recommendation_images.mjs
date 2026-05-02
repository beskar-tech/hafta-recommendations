import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { HAFTA_SHEET_CSV_URL, RAW } from "../src/data.js";
import { recommendationImageKey } from "../src/image-paths.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(ROOT, "public", "recommendations", "images");
const MANIFEST_PATH = path.join(ROOT, "public", "recommendations", "manifest.json");

function cleanTitle(title, type) {
  let t = title || "";
  t = t.replace(/\s+by\s+[^,]+$/i, "");
  t = t.replace(/[,:]?\s*(final\s+)?season\s+\d+\b.*/i, "");
  t = t.replace(/\s*\(\d{4}\)\s*$/, "");
  t = t.replace(/\s+[—–-]\s+.+$/, "");
  if (type !== "tvseries") t = t.replace(/:\s+.+$/, "");
  return t.trim();
}

function cleanText(value) {
  return (value || "").toString().replace(/\s+/g, " ").trim();
}

function normalizeTitleKey(value) {
  return cleanText(value).toLowerCase();
}

function looksLikeUrl(value) {
  return /^https?:\/\//i.test(cleanText(value));
}

function displayTitleFromUrl(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./i, "");
    const pathParts = parsed.pathname.split("/").filter(Boolean).slice(-2);
    const pathValue = pathParts.join(" / ").replace(/[-_]+/g, " ");
    const label = decodeURIComponent(pathValue).replace(/\s+/g, " ").trim();
    if (label && /[a-zA-Z]{3,}/.test(label)) return label;
    return host;
  } catch (_) {
    return cleanText(url);
  }
}

function getHostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
  } catch (_) {
    return null;
  }
}

function inferTypeFromUrl(url) {
  const host = getHostname(url) || "";
  const lowerUrl = url.toLowerCase();
  if (/goodreads|amazon\./.test(host) || /\/dp\/|\/books?\/|stripbooks/.test(lowerUrl)) return "book";
  if (/podcasts\.apple\.com|spotify\.com/.test(host) && /podcast/.test(lowerUrl)) return "podcast";
  if (/music\.apple\.com/.test(host) || (/spotify\.com/.test(host) && !/podcast/.test(lowerUrl))) return "music";
  if (/youtube\.com|youtu\.be/.test(host)) return "video";
  if (/netflix\.com|primevideo\.com|hotstar\.com|jiocinema\.com|sonyliv\.com|appletv\.com|mubi\.com/.test(host)) return "tvseries";
  if (/wikipedia\.org/.test(host)) return "person";
  if (/pdf($|\?)/.test(lowerUrl)) return "report";
  return "article";
}

function inferTypeFromText(title) {
  const t = cleanText(title).toLowerCase();
  if (!t) return "article";
  if (/\bpodcast\b|apple podcasts|acast|search engine with pj vogt|empire podcast|huberman lab/.test(t)) return "podcast";
  if (/spotify|apple music|\balbum\b|\bep\b by |\bmusic\b/.test(t)) return "music";
  if (/official trailer|youtube|extended highlights|full match|interview \|/.test(t)) return "video";
  if (/\breport\b|\bpdf\b|committee report|filetype:pdf/.test(t)) return "report";
  if (/goodreads|amazon\.in: books|novel|memoir|autobiography|biography|essays|dispatches|saga|collection of|a history of|diaries|stories|book\b/.test(t)) return "book";
  if (/\bseason\b|\bseries\b|netflix|prime video|hotstar|apple tv\+|official site|showtime/.test(t)) return "tvseries";
  if (/\bfilm\b|\bmovie\b|cinema\b/.test(t)) return "film";
  return "article";
}

function buildFallbackLookup(raw) {
  const map = new Map();
  raw.forEach(([, , title, type, siteHint]) => {
    const key = normalizeTitleKey(title);
    if (key && !map.has(key)) map.set(key, { type: type || "article", siteHint: siteHint || null });
  });
  return map;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let i = 0;
  let inQuotes = false;

  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === "\"") {
        if (text[i + 1] === "\"") {
          cell += "\"";
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      cell += ch;
      i += 1;
      continue;
    }

    if (ch === "\"") {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (ch === ",") {
      row.push(cell);
      cell = "";
      i += 1;
      continue;
    }
    if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      i += 1;
      continue;
    }
    if (ch === "\r") {
      i += 1;
      continue;
    }
    cell += ch;
    i += 1;
  }

  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

async function loadLiveRecommendations() {
  const fallbackLookup = buildFallbackLookup(RAW);
  const response = await fetch(HAFTA_SHEET_CSV_URL, { cache: "no-store" });
  if (!response.ok) throw new Error(`Sheet fetch failed with ${response.status}`);

  const csv = await response.text();
  const rows = parseCsv(csv);
  if (rows.length < 2) throw new Error("Sheet returned no data rows");

  const header = rows[0].map(cleanText);
  const panellistIndex = header.findIndex((cell) => cell.toLowerCase() === "panellists");
  const recommendationIndexes = header
    .map((cell, index) => ({ cell: cell.toLowerCase(), index }))
    .filter((entry) => entry.cell.startsWith("recommendation "))
    .map((entry) => entry.index);

  if (panellistIndex === -1 || !recommendationIndexes.length) {
    throw new Error("Sheet columns do not match expected format");
  }

  const records = [];
  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    const panellist = cleanText(row[panellistIndex]);
    if (!panellist) continue;

    recommendationIndexes.forEach((index) => {
      const cellValue = cleanText(row[index]);
      if (!cellValue) return;

      const sourceUrl = looksLikeUrl(cellValue) ? cellValue : null;
      const title = sourceUrl ? displayTitleFromUrl(sourceUrl) : cellValue;
      const fallbackMeta = fallbackLookup.get(normalizeTitleKey(cellValue)) || fallbackLookup.get(normalizeTitleKey(title));
      const type = fallbackMeta?.type || (sourceUrl ? inferTypeFromUrl(sourceUrl) : inferTypeFromText(title));
      records.push({ title, type });
    });
  }

  return records;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${url}`);
  }
  return response.json();
}

async function fetchWikiThumb(query) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query.replace(/ /g, "_"))}`;
  try {
    const json = await fetchJson(url, { headers: { Accept: "application/json" } });
    return (json.thumbnail && json.thumbnail.source) || (json.originalimage && json.originalimage.source) || null;
  } catch (_) {
    return null;
  }
}

async function fetchWikiSearchThumb(query) {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}&srlimit=1&origin=*`;
    const json = await fetchJson(url);
    const hit = json.query && json.query.search && json.query.search[0];
    if (!hit) return null;
    return fetchWikiThumb(hit.title);
  } catch (_) {
    return null;
  }
}

async function fetchOpenLibraryCover(title) {
  try {
    const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=1`;
    const json = await fetchJson(url);
    const doc = json.docs && json.docs[0];
    if (doc && doc.cover_i) {
      return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
    }
    return null;
  } catch (_) {
    return null;
  }
}

async function resolveThumbnailUrl(title, type) {
  const cleaned = cleanTitle(title, type);
  if (!cleaned) return null;

  if (type === "book") {
    return (await fetchOpenLibraryCover(cleaned)) || fetchWikiSearchThumb(`${cleaned} novel`);
  }
  if (type === "film") return fetchWikiSearchThumb(`${cleaned} film`);
  if (type === "tvseries" || type === "tv" || type === "series") return fetchWikiSearchThumb(`${cleaned} TV series`);
  if (type === "person") return fetchWikiSearchThumb(cleaned);
  if (type === "podcast") return fetchWikiSearchThumb(`${cleaned} podcast`);
  if (type === "music") return fetchWikiSearchThumb(`${cleaned} album`);
  return null;
}

function extFromContentType(contentType, fallbackUrl) {
  if (contentType?.includes("image/png")) return "png";
  if (contentType?.includes("image/webp")) return "webp";
  if (contentType?.includes("image/jpeg")) return "jpg";
  const byUrl = fallbackUrl.match(/\.([a-zA-Z0-9]+)(?:$|\?)/);
  return byUrl ? byUrl[1].toLowerCase() : "jpg";
}

async function downloadImage(url, filePath) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Image fetch failed: ${response.status} ${url}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(filePath, buffer);
  return response.headers.get("content-type");
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  for (const file of await fs.readdir(OUTPUT_DIR)) {
    await fs.unlink(path.join(OUTPUT_DIR, file));
  }

  const manifest = {};
  const seen = new Set();
  const records = await loadLiveRecommendations();

  for (const record of records) {
    const title = String(record.title || "").trim();
    const type = String(record.type || "article").trim();
    const key = recommendationImageKey(title, type);
    if (!key || seen.has(key)) continue;
    seen.add(key);

    const url = await resolveThumbnailUrl(title, type);
    if (!url) continue;

    try {
      const tempPath = path.join(OUTPUT_DIR, `${key}.tmp`);
      const contentType = await downloadImage(url, tempPath);
      const ext = extFromContentType(contentType, url);
      const fileName = `${key}.${ext}`;
      await fs.rename(tempPath, path.join(OUTPUT_DIR, fileName));
      manifest[key] = fileName;
      console.log(`saved ${fileName}`);
    } catch (error) {
      console.warn(`skip ${key}: ${error.message}`);
    }
  }

  await fs.writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`wrote manifest with ${Object.keys(manifest).length} entries`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

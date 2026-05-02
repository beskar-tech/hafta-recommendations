import JSZip from "jszip";

// Hafta Recommendations dataset
// Format: [episode, panellist, title, type, optionalSiteHint?]
export const RAW = [
  // Ep 586
  [586, "Manisha Pande", "Railsong", "article", "newslaundry.com"],
  [586, "Manisha Pande", "Iran and the Indispensable Broker: How Pakistan Outmaneuvers India on the World Stage", "article"],
  [586, "Anand Vardhan", "Punch Light", "article"],
  [586, "Anand Vardhan", "Satellite imagery reveals increasing volatility in human night-time activity", "article"],
  [586, "Pooja Prasanna", "High-Level Committee Report on Union and State Relations", "report"],
  [586, "Shobana K Nair", "The Secret History by Donna Tartt", "book"],

  // Ep 585
  [585, "Manisha Pande", "1883", "tvseries"],
  [585, "Raman Kirpal", "Secrets of the Bees", "book"],
  [585, "Anuradha", "The Migration Story", "podcast"],
  [585, "Anuradha", "Kohrra", "tvseries"],
  [585, "Anuradha", "The Ex Files", "podcast"],
  [585, "Arghya", "Bait", "film"],
  [585, "Arghya", "Herbert", "book"],
  [585, "Arghya", "The Chronicles of the Lost Daughters", "book"],

  // Ep 584
  [584, "Abhinandan Sekhri", "The Bureau", "tvseries"],
  [584, "Manisha Pande", "Adolescence", "tvseries"],
  [584, "Jayashree Arunachalam", "Severance", "tvseries"],
  [584, "Anand Vardhan", "The Power Broker by Robert Caro", "book"],
  [584, "Raman Kirpal", "How India's hot summer is rewriting the kabaddi calendar", "article", "newslaundry.com"],
  [584, "Suhasini Haidar", "The Fragile Alliance: India and the Quad after Trump 2.0", "article"],

  // Ep 583
  [583, "Abhinandan Sekhri", "Mr. Inbetween", "tvseries"],
  [583, "Manisha Pande", "Conclave", "film"],
  [583, "Jayashree Arunachalam", "The Anxious Generation by Jonathan Haidt", "book"],
  [583, "Anand Vardhan", "On Tyranny by Timothy Snyder", "book"],
  [583, "Mujib Mashal", "How a Whistleblower's Death Has Shaken India", "article"],
  [583, "Raman Kirpal", "Kashmir's apple economy in crisis", "article", "newslaundry.com"],

  // Ep 582
  [582, "Abhinandan Sekhri", "Dahaad", "tvseries"],
  [582, "Manisha Pande", "Chimamanda Ngozi Adichie's Dream Count", "book"],
  [582, "Jayashree Arunachalam", "The Pitt", "tvseries"],
  [582, "Pooja Prasanna", "Reservation Dogs", "tvseries"],
  [582, "Shardool Katyayan", "Bollywood and the politics of the present", "article"],
  [582, "Aishwaria", "The Empusium by Olga Tokarczuk", "book"],

  // Ep 581
  [581, "Abhinandan Sekhri", "Slow Horses", "tvseries"],
  [581, "Manisha Pande", "Black Doves", "tvseries"],
  [581, "Anand Vardhan", "India's Forgotten Country by Bela Bhatia", "book"],
  [581, "Nidhi Suresh", "Inside the violence in Manipur", "article", "newslaundry.com"],
  [581, "T.M. Krishna", "On the politics of Carnatic music", "article"],
  [581, "Aditya", "Stalker by Andrei Tarkovsky", "film"],

  // Ep 580
  [580, "Abhinandan Sekhri", "Bad Sisters", "tvseries"],
  [580, "Manisha Pande", "The Day of the Jackal (2024)", "tvseries"],
  [580, "Jayashree Arunachalam", "Get In, Loser by Pradnya Bivalkar", "book"],
  [580, "Pooja Prasanna", "Shyam Benegal retrospective", "film"],
  [580, "Ajai Shukla", "On India's defence procurement maze", "article"],
  [580, "Anand Vardhan", "The Penguin Book of Indian Journeys", "book"],

  // Ep 579 — Hafta x South Central
  ["Hafta x South Central", "Pooja Prasanna", "Maharaja", "film"],
  ["Hafta x South Central", "Dhanya Rajendran", "All We Imagine as Light", "film"],
  ["Hafta x South Central", "Sudipto Mondal", "The Great Indian Murder podcast", "podcast"],
  ["Hafta x South Central", "Govind Ethiraj", "Kerala's fiscal stress: a primer", "report"],
  ["Hafta x South Central", "Manisha Pande", "Manjummel Boys", "film"],

  // Ep 579
  [579, "Abhinandan Sekhri", "The Gentlemen", "tvseries"],
  [579, "Manisha Pande", "Bhakshak", "film"],
  [579, "Anand Vardhan", "The Anarchy by William Dalrymple", "book"],
  [579, "Raman Kirpal", "Bihar's caste survey: what it reveals", "article", "newslaundry.com"],
  [579, "Jayashree Arunachalam", "Tom Lake by Ann Patchett", "book"],

  // Ep 578
  [578, "Abhinandan Sekhri", "Shogun", "tvseries"],
  [578, "Manisha Pande", "The Diplomat", "tvseries"],
  [578, "Jayashree Arunachalam", "Yellowface by R.F. Kuang", "book"],
  [578, "Anand Vardhan", "Ambedkar: A Life by Shashi Tharoor", "book"],
  [578, "Mridul Dudeja", "Past Lives", "film"],
  [578, "Ishaan Tharoor", "On the future of multilateralism", "article"],

  // Ep 577
  [577, "Abhinandan Sekhri", "Industry", "tvseries"],
  [577, "Manisha Pande", "Heeramandi", "tvseries"],
  [577, "Sumedha Mittal", "Inside India's prison reforms", "article", "newslaundry.com"],
  [577, "Jayashree Arunachalam", "Chip War by Chris Miller", "book"],
  [577, "Anand Vardhan", "The Discovery of India by Jawaharlal Nehru", "book"],
  [577, "Vrinda Grover", "On the UAPA and pre-trial detention", "article"],

  // Ep 576
  [576, "Abhinandan Sekhri", "True Detective: Night Country", "tvseries"],
  [576, "Manisha Pande", "Maamla Legal Hai", "tvseries"],
  [576, "Anand Vardhan", "The Rebel Sultans by Manu S. Pillai", "book"],
  [576, "Raman Kirpal", "How rural distress is reshaping Indian politics", "article", "newslaundry.com"],
  [576, "Reetika Khera", "On NREGA and welfare data", "article"],
  [576, "Amit Kumar", "Killers of the Flower Moon", "film"],

  // Ep 575 — Subscriber's Take 05
  ["Subscriber's Take 05", "Abhinandan Sekhri", "On reader-supported journalism: a long view", "article", "newslaundry.com"],
  ["Subscriber's Take 05", "Manisha Pande", "The Fifth Estate", "film"],
  ["Subscriber's Take 05", "Anand Vardhan", "Public Opinion by Walter Lippmann", "book"],
  ["Subscriber's Take 05", "Jayashree Arunachalam", "Reply All (archive)", "podcast"],

  // Ep 575
  [575, "Abhinandan Sekhri", "Ripley", "tvseries"],
  [575, "Manisha Pande", "Poor Things", "film"],
  [575, "Jayashree Arunachalam", "The Bee Sting by Paul Murray", "book"],
  [575, "Anand Vardhan", "Why Nations Fail by Acemoglu and Robinson", "book"],
  [575, "Aniruddh Menon", "The Three-Body Problem", "tvseries"],
  [575, "Santosh Desai", "On Indian middle-class anxiety", "article"],

  // Ep 574
  [574, "Abhinandan Sekhri", "The Bear, season 3", "tvseries"],
  [574, "Manisha Pande", "Laapataa Ladies", "film"],
  [574, "Pooja Prasanna", "Aattam", "film"],
  [574, "Shardool Katyayan", "On the Ayodhya verdict, in retrospect", "article"],
  [574, "Anand Vardhan", "India After Gandhi by Ramachandra Guha", "book"],
  [574, "Chander Shekhar Luthara", "The Boys", "tvseries"],

  // Ep 573
  [573, "Abhinandan Sekhri", "Fargo, season 5", "tvseries"],
  [573, "Manisha Pande", "Dune: Part Two", "film"],
  [573, "Jayashree Arunachalam", "Search Engine with PJ Vogt", "podcast"],
  [573, "Anand Vardhan", "The Light of Asia by Jairam Ramesh", "book"],
  [573, "Sreenivasan Jain", "On the BBC India tax raids — two years on", "article"],
  [573, "Nidhi Suresh", "Manipur's displaced", "article", "newslaundry.com"],

  // Ep 572
  [572, "Abhinandan Sekhri", "Mr. and Mrs. Smith (2024)", "tvseries"],
  [572, "Manisha Pande", "Sapta Sagaradaache Ello", "film"],
  [572, "Pooja Prasanna", "All Quiet on the Western Front", "film"],
  [572, "Jayashree Arunachalam", "Dolly Parton — Run Rose Run", "music"],
  [572, "Anand Vardhan", "An Era of Darkness by Shashi Tharoor", "book"],
  [572, "Bashir Ali Abbas", "On India and the Red Sea crisis", "article"],

  // Ep 571
  [571, "Abhinandan Sekhri", "The Crown, final season", "tvseries"],
  [571, "Manisha Pande", "12th Fail", "film"],
  [571, "Anand Vardhan", "Coromandel by Charles Allen", "book"],
  [571, "Raman Kirpal", "On India's media ownership patterns", "article", "newslaundry.com"],
  [571, "Fahad Zuberi", "On the new Parliament building, architecturally", "article"],
  [571, "Sumedha Mittal", "Bilkis Bano case: a timeline", "article", "newslaundry.com"],

  // Ep 570
  [570, "Abhinandan Sekhri", "Beef", "tvseries"],
  [570, "Manisha Pande", "Joyland", "film"],
  [570, "Jayashree Arunachalam", "Tár", "film"],
  [570, "Pooja Prasanna", "Jawan", "film"],
  [570, "Anand Vardhan", "The Idea of India by Sunil Khilnani", "book"],
  [570, "Kallol Bhattacherjee", "On India's neighbourhood diplomacy", "article"],

  // Ep 569
  [569, "Abhinandan Sekhri", "Succession, season 4", "tvseries"],
  [569, "Manisha Pande", "Anatomy of a Fall", "film"],
  [569, "Jayashree Arunachalam", "Hanif Kureishi's Shattered", "book"],
  [569, "Anand Vardhan", "Why I Am a Hindu by Shashi Tharoor", "book"],
  [569, "Nikhil Inamdar", "On India's startup winter", "article"],
  [569, "Sudhir Mishra", "Oppenheimer", "film"],

  // Ep 568
  [568, "Abhinandan Sekhri", "The Last of Us", "tvseries"],
  [568, "Manisha Pande", "Aftersun", "film"],
  [568, "Jayashree Arunachalam", "The Covenant of Water by Abraham Verghese", "book"],
  [568, "Anand Vardhan", "Midnight's Children by Salman Rushdie", "book"],
  [568, "Shaun Tandon", "On India and the global press freedom rankings", "report"],
  [568, "Amba Kak", "On AI governance — what India should watch", "article"],
  [568, "Pooja Prasanna", "Kantara", "film"],

  // A few cross-cutting people refs and music
  [580, "Manisha Pande", "Arooj Aftab", "person"],
  [577, "Jayashree Arunachalam", "Brittany Howard — What Now", "music"],
  [573, "Pooja Prasanna", "T.M. Krishna at the Madras Music Academy", "video"],
  [571, "Manisha Pande", "Rana Ayyub on press freedom (interview)", "video"],
  [569, "Anand Vardhan", "Pratap Bhanu Mehta", "person"],
  [568, "Pooja Prasanna", "K.R. Meera", "person"],
];

export const HAFTA_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1VCmV6yr5t1LHE77Xp5-cYhWrQSkhW3A8nix310MvRQU/export?format=csv&gid=0";
export const HAFTA_SHEET_XLSX_URL = "https://docs.google.com/spreadsheets/d/1VCmV6yr5t1LHE77Xp5-cYhWrQSkhW3A8nix310MvRQU/export?format=xlsx";

function cleanText(value) {
  return (value || "").toString().replace(/\s+/g, " ").trim();
}

  function normalizeTitleKey(value) {
    return cleanText(value).toLowerCase();
  }

  function looksLikeUrl(value) {
    return /^https?:\/\//i.test(cleanText(value));
  }

  function getHostname(url) {
    try {
      return new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
    } catch (_) {
      return null;
    }
  }

  function sourceLabelFromUrl(url) {
    const host = getHostname(url) || "";
    const labels = {
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
    if (labels[host]) return labels[host];
    const parts = host.split(".");
    const core = parts.length > 1 ? parts[parts.length - 2] : parts[0];
    return core ? core.replace(/[-_]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()) : null;
  }

  function displayTitleFromUrl(url) {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace(/^www\./i, "");
      const pathParts = parsed.pathname.split("/").filter(Boolean).slice(-2);
      const path = pathParts.join(" / ").replace(/[-_]+/g, " ");
      const label = decodeURIComponent(path).replace(/\s+/g, " ").trim();
      if (label && /[a-zA-Z]{3,}/.test(label)) return label;
      return host;
    } catch (_) {
      return cleanText(url);
    }
  }

function normalizeEpisode(value) {
  const cleaned = cleanText(value);
  if (!cleaned) return null;
  if (/^\d+$/.test(cleaned)) return Number(cleaned);
  return cleaned
    .replace(/^Hafta\s+/i, "")
    .replace(/\s*Ep:\s*/i, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
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
    if (/the hindu|the indian express|new york times|news|opinion|explained|the wire|caravan|mint|magazine|journal|interview/.test(t)) return "article";
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

  function materializeRaw(raw) {
    return raw.map(([episode, panellist, title, type, siteHint]) => ({
      episode,
      panellist: cleanText(panellist),
      title: cleanText(title),
      type: type || "article",
      siteHint: siteHint || null,
      sourceUrl: looksLikeUrl(title) ? cleanText(title) : null,
      sourceLabel: looksLikeUrl(title) ? sourceLabelFromUrl(cleanText(title)) : null,
    }));
  }

  function parseXml(text) {
    return new DOMParser().parseFromString(text, "application/xml");
  }

  function colRef(index) {
    let n = index + 1;
    let out = "";
    while (n > 0) {
      const rem = (n - 1) % 26;
      out = String.fromCharCode(65 + rem) + out;
      n = Math.floor((n - 1) / 26);
    }
    return out;
  }

  function getCellValue(cell, sharedStrings) {
    if (!cell) return "";
    const kind = cell.getAttribute("t");
    const v = cell.getElementsByTagName("v")[0];
    if (!v) return "";
    if (kind === "s") return sharedStrings[Number(v.textContent)] || "";
    return v.textContent || "";
  }

  async function loadRecommendationsFromXlsx(fallbackLookup) {
    if (!JSZip) throw new Error("JSZip not available");

    const response = await fetch(HAFTA_SHEET_XLSX_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`XLSX fetch failed with ${response.status}`);

    const zip = await JSZip.loadAsync(await response.arrayBuffer());
    const workbookXml = parseXml(await zip.file("xl/workbook.xml").async("string"));
    const workbookRelsXml = parseXml(await zip.file("xl/_rels/workbook.xml.rels").async("string"));

    const workbookRelMap = {};
    Array.from(workbookRelsXml.getElementsByTagName("Relationship")).forEach((rel) => {
      workbookRelMap[rel.getAttribute("Id")] = rel.getAttribute("Target");
    });

    const sheetEl = Array.from(workbookXml.getElementsByTagName("sheet")).find((sheet) =>
      cleanText(sheet.getAttribute("name")).toLowerCase() === "hafta reccomendations"
    );
    if (!sheetEl) throw new Error("Could not find Hafta recommendations sheet in workbook");

    const relId = sheetEl.getAttribute("r:id");
    const sheetTarget = workbookRelMap[relId];
    if (!sheetTarget) throw new Error("Workbook sheet relationship missing");

    const sheetPath = `xl/${sheetTarget.replace(/^\/+/, "")}`;
    const relBase = sheetPath.slice(0, sheetPath.lastIndexOf("/") + 1);
    const sheetRelsPath = `${relBase}_rels/${sheetPath.slice(sheetPath.lastIndexOf("/") + 1)}.rels`;

    const sharedStringsXml = parseXml(await zip.file("xl/sharedStrings.xml").async("string"));
    const sharedStrings = Array.from(sharedStringsXml.getElementsByTagName("si")).map((si) =>
      Array.from(si.getElementsByTagName("t")).map((t) => t.textContent || "").join("")
    );

    const sheetXml = parseXml(await zip.file(sheetPath).async("string"));
    const sheetRelsXml = parseXml(await zip.file(sheetRelsPath).async("string"));
    const hyperlinkRelMap = {};
    Array.from(sheetRelsXml.getElementsByTagName("Relationship")).forEach((rel) => {
      hyperlinkRelMap[rel.getAttribute("Id")] = rel.getAttribute("Target");
    });

    const hyperlinks = {};
    Array.from(sheetXml.getElementsByTagName("hyperlink")).forEach((link) => {
      const ref = link.getAttribute("ref");
      const id = link.getAttribute("r:id");
      if (ref && id && hyperlinkRelMap[id]) hyperlinks[ref] = hyperlinkRelMap[id];
    });

    const rows = Array.from(sheetXml.getElementsByTagName("row"));
    if (!rows.length) throw new Error("Workbook sheet has no rows");

    const headerRow = rows[0];
    const headerCells = {};
    Array.from(headerRow.getElementsByTagName("c")).forEach((cell) => {
      headerCells[cell.getAttribute("r")] = cleanText(getCellValue(cell, sharedStrings));
    });

    const recommendationIndexes = [];
    let panellistIndex = -1;
    for (let idx = 0; idx < 26; idx += 1) {
      const label = (headerCells[`${colRef(idx)}1`] || "").toLowerCase();
      if (label === "panellists") panellistIndex = idx;
      if (label.startsWith("recommendation ")) recommendationIndexes.push(idx);
    }

    if (panellistIndex === -1 || !recommendationIndexes.length) {
      throw new Error("Workbook columns do not match expected format");
    }

    let currentEpisode = null;
    const records = [];

    rows.slice(1).forEach((row) => {
      const rowNumber = row.getAttribute("r");
      const cells = {};
      Array.from(row.getElementsByTagName("c")).forEach((cell) => {
        cells[cell.getAttribute("r")] = cell;
      });

      const episodeValue = normalizeEpisode(getCellValue(cells[`A${rowNumber}`], sharedStrings));
      if (episodeValue !== null) currentEpisode = episodeValue;

      const panellist = cleanText(getCellValue(cells[`${colRef(panellistIndex)}${rowNumber}`], sharedStrings));
      if (!currentEpisode || !panellist) return;

      recommendationIndexes.forEach((index) => {
        const ref = `${colRef(index)}${rowNumber}`;
        const cellValue = cleanText(getCellValue(cells[ref], sharedStrings));
        if (!cellValue) return;

        const hyperlink = hyperlinks[ref] ? cleanText(hyperlinks[ref]) : null;
        const sourceUrl = hyperlink || (looksLikeUrl(cellValue) ? cleanText(cellValue) : null);
        const title = sourceUrl && looksLikeUrl(cellValue) ? displayTitleFromUrl(sourceUrl) : cellValue;
        const fallbackMeta = fallbackLookup.get(normalizeTitleKey(cellValue)) || fallbackLookup.get(normalizeTitleKey(title));
        const type = fallbackMeta?.type || (sourceUrl ? inferTypeFromUrl(sourceUrl) : inferTypeFromText(title));
        const siteHint = sourceUrl ? getHostname(sourceUrl) : (fallbackMeta?.siteHint || null);

        records.push({
          episode: currentEpisode,
          panellist,
          title,
          type,
          siteHint,
          sourceUrl,
          sourceLabel: sourceUrl ? sourceLabelFromUrl(sourceUrl) : null,
        });
      });
    });

    if (!records.length) throw new Error("Workbook parsed but produced zero recommendations");
    return records;
  }

  async function loadRecommendations() {
    const fallbackRecords = materializeRaw(RAW);
    const fallbackLookup = buildFallbackLookup(RAW);

    try {
      const xlsxRecords = await loadRecommendationsFromXlsx(fallbackLookup);
      return {
        records: xlsxRecords,
        source: "sheet",
        count: xlsxRecords.length,
      };
    } catch (xlsxError) {
      console.warn("[Hafta] XLSX load failed, trying CSV:", xlsxError);
    }

    try {
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

      let currentEpisode = null;
      const records = [];

      for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
        const row = rows[rowIndex];
        const rawEpisode = normalizeEpisode(row[0]);
        if (rawEpisode !== null) currentEpisode = rawEpisode;

        const panellist = cleanText(row[panellistIndex]);
        if (!currentEpisode || !panellist) continue;

        recommendationIndexes.forEach((index) => {
          const cellValue = cleanText(row[index]);
          if (!cellValue) return;

          const sourceUrl = looksLikeUrl(cellValue) ? cellValue : null;
          const title = sourceUrl ? displayTitleFromUrl(sourceUrl) : cellValue;
          const fallbackMeta = fallbackLookup.get(normalizeTitleKey(cellValue)) || fallbackLookup.get(normalizeTitleKey(title));
          const type = fallbackMeta?.type || (sourceUrl ? inferTypeFromUrl(sourceUrl) : inferTypeFromText(title));
          const siteHint = sourceUrl ? getHostname(sourceUrl) : (fallbackMeta?.siteHint || null);

          records.push({
            episode: currentEpisode,
            panellist,
            title,
            type,
            siteHint,
            sourceUrl,
            sourceLabel: sourceUrl ? sourceLabelFromUrl(sourceUrl) : null,
          });
        });
      }

      if (!records.length) throw new Error("Sheet parsed but produced zero recommendations");

      return {
        records,
        source: "sheet",
        count: records.length,
      };
    } catch (error) {
      console.warn("[Hafta] Falling back to bundled dataset:", error);
      return {
        records: fallbackRecords,
        source: "fallback",
        count: fallbackRecords.length,
        error: error.message,
      };
    }
  }

export const HAFTA_DATA = {
  loadRecommendations,
  materializeRaw,
};

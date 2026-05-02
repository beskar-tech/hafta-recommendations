import { useEffect, useMemo, useRef, useState } from "react";
import { Chips, RecCard, TypeStrip } from "./components";
import { EpisodeBlock, PanellistModal } from "./episode-modal";
import { HAFTA_DATA, RAW } from "./data";
import { HU } from "./utils";

const PAGE_SIZE = 50;

export default function App() {
  const [allRecs, setAllRecs] = useState(() => HAFTA_DATA.materializeRaw(RAW));
  const [dataSource, setDataSource] = useState("loading");
  const [dataError, setDataError] = useState("");
  const [q, setQ] = useState("");
  const [panellistFilter, setPanellistFilter] = useState("");
  const [episodeFilter, setEpisodeFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("episode-desc");
  const [view, setView] = useState("cards");
  const [modalName, setModalName] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("hafta:theme") || "light";
    } catch (_) {
      return "light";
    }
  });
  const searchRef = useRef(null);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    HAFTA_DATA.loadRecommendations().then((result) => {
      if (cancelled) return;
      setAllRecs(result.records);
      setDataSource(result.source);
      setDataError(result.error || "");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("hafta:theme", theme);
    } catch (_) {}
  }, [theme]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "Escape" && !modalName) {
        if (document.activeElement === searchRef.current) searchRef.current.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalName]);

  const filtered = useMemo(() => {
    const qn = q.trim().toLowerCase();
    return allRecs.filter((r) => {
      if (typeFilter && r.type !== typeFilter) return false;
      if (panellistFilter && r.panellist !== panellistFilter) return false;
      if (episodeFilter && HU.episodeKey(r.episode) !== episodeFilter) return false;
      if (qn) {
        const hay = `${r.title} ${r.panellist}`.toLowerCase();
        if (!hay.includes(qn)) return false;
      }
      return true;
    });
  }, [allRecs, q, panellistFilter, episodeFilter, typeFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const epSort = (a, b, dir) => {
      const an = typeof a.episode === "number";
      const bn = typeof b.episode === "number";
      if (an && bn) return dir === "desc" ? b.episode - a.episode : a.episode - b.episode;
      if (an) return dir === "desc" ? -1 : 1;
      if (bn) return dir === "desc" ? 1 : -1;
      return String(a.episode).localeCompare(String(b.episode));
    };
    if (sortBy === "episode-desc") arr.sort((a, b) => epSort(a, b, "desc"));
    else if (sortBy === "episode-asc") arr.sort((a, b) => epSort(a, b, "asc"));
    else if (sortBy === "panellist") arr.sort((a, b) => a.panellist.localeCompare(b.panellist));
    else if (sortBy === "type") arr.sort((a, b) => a.type.localeCompare(b.type));
    return arr;
  }, [filtered, sortBy]);

  const typeCounts = useMemo(() => {
    const counts = {};
    const baseFiltered = allRecs.filter((r) => {
      if (panellistFilter && r.panellist !== panellistFilter) return false;
      if (episodeFilter && HU.episodeKey(r.episode) !== episodeFilter) return false;
      const qn = q.trim().toLowerCase();
      if (qn) {
        const hay = `${r.title} ${r.panellist}`.toLowerCase();
        if (!hay.includes(qn)) return false;
      }
      return true;
    });
    baseFiltered.forEach((r) => {
      counts[r.type] = (counts[r.type] || 0) + 1;
    });
    return counts;
  }, [allRecs, q, panellistFilter, episodeFilter]);

  const episodes = useMemo(() => {
    const set = new Set();
    allRecs.forEach((r) => set.add(HU.episodeKey(r.episode)));
    const list = [...set];
    list.sort((a, b) => {
      const an = !Number.isNaN(Number(a));
      const bn = !Number.isNaN(Number(b));
      if (an && bn) return Number(b) - Number(a);
      if (an) return 1;
      if (bn) return -1;
      return a.localeCompare(b);
    });
    return list;
  }, [allRecs]);

  const allPanellists = useMemo(() => [...new Set(allRecs.map((r) => r.panellist))].sort(), [allRecs]);

  const grouped = useMemo(() => {
    const map = new Map();
    sorted.forEach((r) => {
      const k = HU.episodeKey(r.episode);
      if (!map.has(k)) map.set(k, { episode: r.episode, recs: [] });
      map.get(k).recs.push(r);
    });
    const list = [...map.values()];
    list.sort((a, b) => {
      const an = typeof a.episode === "number";
      const bn = typeof b.episode === "number";
      if (an && bn) return b.episode - a.episode;
      if (an) return 1;
      if (bn) return -1;
      return 0;
    });
    return list;
  }, [sorted]);

  const currentItems = view === "cards" ? sorted : grouped;
  const visibleItems = useMemo(
    () => currentItems.slice(0, visibleCount),
    [currentItems, visibleCount],
  );
  const hasMore = visibleCount < currentItems.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [view, q, panellistFilter, episodeFilter, typeFilter, sortBy, allRecs]);

  useEffect(() => {
    if (!hasMore || !loadMoreRef.current) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setVisibleCount((count) => Math.min(count + PAGE_SIZE, currentItems.length));
        }
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, currentItems.length]);

  const clear = (key) => {
    if (key === "q") setQ("");
    if (key === "panellist") setPanellistFilter("");
    if (key === "episode") setEpisodeFilter("");
    if (key === "type") setTypeFilter("");
  };

  const totalRecs = allRecs.length;
  const totalEpisodes = episodes.length;
  const totalPanellists = allPanellists.length;

  return (
    <div data-screen-label="Hafta Recommendations">
      <button
        className="theme-toggle"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label="Toggle theme"
        title={theme === "dark" ? "Switch to light" : "Switch to dark"}
      >
        {theme === "dark" ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" /></svg>
        )}
        <span>{theme === "dark" ? "Light" : "Dark"}</span>
      </button>

      <header className="masthead">
        <div className="masthead-inner">
          <div>
            <div className="pretitle">
              <span className="dot"></span>
              Newslaundry · Hafta · Recommendations · <span style={{ color: "var(--ink)" }}>Editorial Index</span>
            </div>
            <h1 className="wordmark">
              Hafta<span className="slash"> / </span><span className="accent">Recommendations</span>
            </h1>
            <p className="lede">
              <em style={{ fontFamily: "var(--font-serif)", color: "var(--red)", fontWeight: 600 }}>The Editorial Index.</em>{" "}
              Hairline-bordered cards and grouped episode blocks. Books route to <span className="key">Goodreads</span>, films to{" "}
              <span className="key">IMDb</span>, podcasts to <span className="key">Apple Podcasts</span>, articles to a publisher search.
              Press <span className="key">/</span> to search, or click any panellist to read their full history.
            </p>
            <div className="source-note">
              {dataSource === "loading" && "Loading the live recommendations spreadsheet…"}
              {dataSource === "sheet" && `Live sheet loaded · ${totalEpisodes} episodes indexed`}
              {dataSource === "fallback" && `Live sheet unavailable, showing bundled snapshot${dataError ? ` · ${dataError}` : ""}`}
            </div>
          </div>
          <div className="stats-strip">
            <button className={`stat stat-button ${view === "cards" ? "active" : ""}`} onClick={() => setView("cards")}>
              <div className="num">{totalRecs}</div><div className="lab">Recs</div>
            </button>
            <button className={`stat stat-button ${view === "episodes" ? "active" : ""}`} onClick={() => setView("episodes")}>
              <div className="num">{totalEpisodes}</div><div className="lab">Episodes</div>
            </button>
            <div className="stat"><div className="num">{totalPanellists}</div><div className="lab">Panellists</div></div>
          </div>
        </div>
      </header>

      <div className="cmd-bar">
        <div className="cmd-inner">
          <div className="cmd-search">
            <span className="icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
              </svg>
            </span>
            <input ref={searchRef} placeholder="Search titles or panellists…" value={q} onChange={(e) => setQ(e.target.value)} />
            {!q && <span className="kbd">/</span>}
          </div>
          <div className="cmd-select">
            <select value={panellistFilter} onChange={(e) => setPanellistFilter(e.target.value)}>
              <option value="">All panellists</option>
              {allPanellists.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="cmd-select">
            <select value={episodeFilter} onChange={(e) => setEpisodeFilter(e.target.value)}>
              <option value="">All episodes</option>
              {episodes.map((ep) => (
                <option key={ep} value={ep}>{HU.episodeLabel(Number.isNaN(Number(ep)) ? ep : Number(ep))}</option>
              ))}
            </select>
          </div>
          <div className="cmd-select">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="episode-desc">Latest episodes</option>
              <option value="episode-asc">Oldest episodes</option>
              <option value="panellist">By panellist</option>
              <option value="type">By type</option>
            </select>
          </div>
          <div className="view-toggle">
            <button className={view === "cards" ? "active" : ""} onClick={() => setView("cards")}>Cards</button>
            <button className={view === "episodes" ? "active" : ""} onClick={() => setView("episodes")}>Episodes</button>
          </div>
        </div>
      </div>

      <TypeStrip counts={typeCounts} active={typeFilter} onToggle={(t) => setTypeFilter(typeFilter === t ? "" : t)} />
      <Chips filters={{ q, panellist: panellistFilter, episode: episodeFilter, type: typeFilter }} onClear={clear} />

      <main className="main">
        {sorted.length === 0 ? (
          <div className="empty"><div className="h">No matches</div><div className="sub">Try clearing a filter, or search for a different name</div></div>
        ) : view === "cards" ? (
          <div className="cards-grid">
            {visibleItems.map((r, i) => {
              const featured = i % 7 === 0 && i > 0;
              const full = i % 13 === 0 && i > 0;
              return (
                <RecCard
                  key={`${HU.episodeKey(r.episode)}-${r.panellist}-${i}`}
                  rec={r}
                  query={q}
                  featured={featured && !full}
                  full={full}
                  onPanellistClick={(n) => setModalName(n)}
                  onEpisodeClick={(ep) => setEpisodeFilter(HU.episodeKey(ep))}
                />
              );
            })}
          </div>
        ) : (
          <div>
            {visibleItems.map((g) => (
              <EpisodeBlock
                key={HU.episodeKey(g.episode)}
                episode={g.episode}
                recs={g.recs}
                query={q}
                onPanellistClick={(n) => setModalName(n)}
              />
            ))}
          </div>
        )}
        {sorted.length > 0 && (
          <div className="pagination-status" aria-live="polite">
            <span>
              Showing {Math.min(visibleCount, currentItems.length)} of {currentItems.length} {view === "cards" ? "results" : "episodes"}
            </span>
            {hasMore ? <div ref={loadMoreRef} className="pagination-sentinel">Loading more…</div> : <span>All loaded</span>}
          </div>
        )}
      </main>

      <footer className="footer">
        Recommendations from Hafta · Newslaundry · sourced from the public Hafta/Charcha recommendations sheet
      </footer>

      {modalName && (
        <PanellistModal
          name={modalName}
          allRecs={allRecs}
          onClose={() => setModalName(null)}
          onEpisodeClick={(ep) => {
            setEpisodeFilter(HU.episodeKey(ep));
            setModalName(null);
          }}
        />
      )}
    </div>
  );
}

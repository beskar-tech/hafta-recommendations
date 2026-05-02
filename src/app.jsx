import { useEffect, useMemo, useRef, useState } from "react";
import { Chips, PanellistCard, RecCard, TypeStrip } from "./components";
import { EpisodeBlock, PanellistModal } from "./episode-modal";
import { HAFTA_DATA, RAW } from "./data";
import { PANELLISTS } from "./panellists";
import { HU } from "./utils";

const PAGE_SIZE = 50;
const VIEW_PATHS = {
  cards: "/",
  episodes: "/episodes",
  panellists: "/panelists",
};

function stateFromLocation(location) {
  const pathname = location.pathname;
  const params = new URLSearchParams(location.search);

  let view = "cards";
  if (pathname === "/episodes") view = "episodes";
  if (pathname === "/panelists") view = "panellists";

  return {
    view,
    q: params.get("q") || "",
    panellistFilter: params.get("panellist") || "",
    episodeFilter: params.get("episode") || "",
    typeFilter: params.get("type") || "",
    sortBy: params.get("sort") || "episode-desc",
  };
}

function buildLocationForState({ view, q, panellistFilter, episodeFilter, typeFilter, sortBy }) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (panellistFilter) params.set("panellist", panellistFilter);
  if (episodeFilter) params.set("episode", episodeFilter);
  if (typeFilter) params.set("type", typeFilter);
  if (sortBy && sortBy !== "episode-desc") params.set("sort", sortBy);

  const search = params.toString();
  return `${VIEW_PATHS[view] || "/"}${search ? `?${search}` : ""}`;
}

export default function App() {
  const initialState = stateFromLocation(window.location);
  const [allRecs, setAllRecs] = useState(() => HAFTA_DATA.materializeRaw(RAW));
  const [dataSource, setDataSource] = useState("loading");
  const [dataError, setDataError] = useState("");
  const [q, setQ] = useState(initialState.q);
  const [panellistFilter, setPanellistFilter] = useState(initialState.panellistFilter);
  const [episodeFilter, setEpisodeFilter] = useState(initialState.episodeFilter);
  const [typeFilter, setTypeFilter] = useState(initialState.typeFilter);
  const [sortBy, setSortBy] = useState(initialState.sortBy);
  const [view, setView] = useState(initialState.view);
  const [modalName, setModalName] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showFloatingBrand, setShowFloatingBrand] = useState(false);
  const [mobileControlsOpen, setMobileControlsOpen] = useState(false);
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
    const onScroll = () => {
      setShowFloatingBrand(window.scrollY > 180);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const nextState = stateFromLocation(window.location);
      setView(nextState.view);
      setQ(nextState.q);
      setPanellistFilter(nextState.panellistFilter);
      setEpisodeFilter(nextState.episodeFilter);
      setTypeFilter(nextState.typeFilter);
      setSortBy(nextState.sortBy);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const nextUrl = buildLocationForState({
      view,
      q,
      panellistFilter,
      episodeFilter,
      typeFilter,
      sortBy,
    });

    const currentUrl = `${window.location.pathname}${window.location.search}`;
    if (currentUrl !== nextUrl) {
      window.history.replaceState({}, "", nextUrl);
    }
  }, [view, q, panellistFilter, episodeFilter, typeFilter, sortBy]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && document.activeElement !== searchRef.current) {
        e.preventDefault();
        if (window.innerWidth <= 720) {
          setMobileControlsOpen(true);
        }
        searchRef.current?.focus();
      } else if (e.key === "Escape" && !modalName) {
        if (mobileControlsOpen) {
          setMobileControlsOpen(false);
        } else if (document.activeElement === searchRef.current) {
          searchRef.current.blur();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalName, mobileControlsOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 720) setMobileControlsOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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

  const panelistDirectory = useMemo(() => {
    const lowerQ = q.trim().toLowerCase();
    const entries = new Map();

    allRecs.forEach((rec) => {
      const existing = entries.get(rec.panellist) || {
        name: rec.panellist,
        role: PANELLISTS[rec.panellist]?.role || "Guest contributor",
        bio: PANELLISTS[rec.panellist]?.bio || null,
        recommendationCount: 0,
        episodes: new Set(),
        firstNumeric: null,
        latestNumeric: null,
        firstSpecial: null,
        latestSpecial: null,
        typeCounts: {},
      };

      existing.recommendationCount += 1;
      existing.episodes.add(HU.episodeKey(rec.episode));
      existing.typeCounts[rec.type] = (existing.typeCounts[rec.type] || 0) + 1;

      if (typeof rec.episode === "number") {
        existing.firstNumeric = existing.firstNumeric == null ? rec.episode : Math.min(existing.firstNumeric, rec.episode);
        existing.latestNumeric = existing.latestNumeric == null ? rec.episode : Math.max(existing.latestNumeric, rec.episode);
      } else {
        existing.firstSpecial = existing.firstSpecial || rec.episode;
        existing.latestSpecial = rec.episode;
      }

      entries.set(rec.panellist, existing);
    });

    return [...entries.values()]
      .map((entry) => {
        return {
          name: entry.name,
          role: entry.role,
          bio: entry.bio,
          recommendationCount: entry.recommendationCount,
          episodeCount: entry.episodes.size,
          firstSeen: entry.firstNumeric != null ? HU.episodeLabel(entry.firstNumeric) : entry.firstSpecial || "—",
          latestSeen: entry.latestNumeric != null ? HU.episodeLabel(entry.latestNumeric) : entry.latestSpecial || "—",
        };
      })
      .filter((panelist) => {
        if (panellistFilter && panelist.name !== panellistFilter) return false;
        if (!lowerQ) return true;
        const hay = `${panelist.name} ${panelist.role} ${panelist.bio || ""}`.toLowerCase();
        return hay.includes(lowerQ);
      })
      .sort((a, b) => {
        if (b.recommendationCount !== a.recommendationCount) return b.recommendationCount - a.recommendationCount;
        return a.name.localeCompare(b.name);
      });
  }, [allRecs, q, panellistFilter]);

  const currentItems = view === "cards" ? sorted : view === "episodes" ? grouped : panelistDirectory;
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

  const changeView = (nextView) => {
    if (nextView === "panellists") {
      setEpisodeFilter("");
      setTypeFilter("");
    }
    setView(nextView);
  };

  const goHome = () => {
    setView("cards");
    setQ("");
    setPanellistFilter("");
    setEpisodeFilter("");
    setTypeFilter("");
    setSortBy("episode-desc");
    setModalName(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEpisodeFilter = (episode) => {
    setView("episodes");
    setEpisodeFilter(HU.episodeKey(episode));
    setModalName(null);
  };

  const totalRecs = allRecs.length;
  const totalEpisodes = episodes.length;
  const totalPanellists = allPanellists.length;
  const activeFilterCount = [q, panellistFilter, episodeFilter, typeFilter].filter(Boolean).length;

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
              Newslaundry · Hafta · Recommendations
            </div>
            <div className="wordmark-row">
              <h1 className="wordmark">
                Hafta<span className="slash"> / </span><span className="accent">Recommendations</span>
              </h1>
              <button className="masthead-brand" onClick={goHome} aria-label="Go to homepage" title="Go to homepage">
                <img src="/nl-person.png" alt="" />
              </button>
            </div>
            <p className="lede">
              The recommendations are captured here based on the data published by the good folks at Newslaundry. If anything is
              found inaccurate, please raise a PR at{" "}
              <a href="https://github.com/beskar-tech/hafta-recommendations" target="_blank" rel="noopener">
                <em>Github</em>
              </a>{" "}
              or reach out to folks at{" "}
              <a href="https://beskar.tech" target="_blank" rel="noopener">
                <em>Beskar Technologies</em>
              </a>.
            </p>
            <div className="source-note">
              {dataSource === "loading" && "Loading the live recommendations spreadsheet…"}
              {dataSource === "sheet" && `Live sheet loaded · ${totalEpisodes} episodes indexed`}
              {dataSource === "fallback" && `Live sheet unavailable, showing bundled snapshot${dataError ? ` · ${dataError}` : ""}`}
            </div>
          </div>
          <div className="stats-strip">
            <button className={`stat stat-button ${view === "cards" ? "active" : ""}`} onClick={() => changeView("cards")}>
              <div className="num">{totalRecs}</div><div className="lab">Recs</div>
            </button>
            <button className={`stat stat-button ${view === "episodes" ? "active" : ""}`} onClick={() => changeView("episodes")}>
              <div className="num">{totalEpisodes}</div><div className="lab">Episodes</div>
            </button>
            <button className={`stat stat-button ${view === "panellists" ? "active" : ""}`} onClick={() => changeView("panellists")}>
              <div className="num">{totalPanellists}</div><div className="lab">Panellists</div>
            </button>
          </div>
        </div>
      </header>

      <div className="cmd-bar">
        <button
          className={`floating-brand floating-brand-desktop ${showFloatingBrand ? "visible" : ""}`}
          onClick={goHome}
          aria-label="Go to homepage"
          title="Go to homepage"
        >
          <img src="/nl-person.png" alt="" />
        </button>
        <div className="cmd-inner">
          <div className="cmd-mobile-brand-slot">
            <button
              className={`floating-brand floating-brand-mobile ${showFloatingBrand ? "visible" : ""}`}
              onClick={goHome}
              aria-label="Go to homepage"
              title="Go to homepage"
            >
              <img src="/nl-person.png" alt="" />
            </button>
          </div>
          <div className="cmd-controls-desktop">
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
            {view !== "panellists" && (
              <div className="cmd-select">
                <select value={episodeFilter} onChange={(e) => setEpisodeFilter(e.target.value)}>
                  <option value="">All episodes</option>
                  {episodes.map((ep) => (
                    <option key={ep} value={ep}>{HU.episodeLabel(Number.isNaN(Number(ep)) ? ep : Number(ep))}</option>
                  ))}
                </select>
              </div>
            )}
            {view !== "panellists" && (
              <div className="cmd-select">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="episode-desc">Latest episodes</option>
                  <option value="episode-asc">Oldest episodes</option>
                  <option value="panellist">By panellist</option>
                  <option value="type">By type</option>
                </select>
              </div>
            )}
          </div>
          <div className="view-toggle">
            <button className={view === "cards" ? "active" : ""} onClick={() => changeView("cards")}>Cards</button>
            <button className={view === "episodes" ? "active" : ""} onClick={() => changeView("episodes")}>Episodes</button>
            <button className={view === "panellists" ? "active" : ""} onClick={() => changeView("panellists")}>Panellists</button>
          </div>
          <button
            className={`cmd-menu-toggle ${mobileControlsOpen ? "active" : ""}`}
            onClick={() => setMobileControlsOpen((open) => !open)}
            aria-expanded={mobileControlsOpen}
            aria-label="Open search and filters"
          >
            <span className="cmd-menu-lines" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </span>
            <span className="cmd-menu-copy">Browse</span>
            {activeFilterCount > 0 && <span className="cmd-menu-badge">{activeFilterCount}</span>}
          </button>
        </div>
        <div className={`mobile-controls-panel ${mobileControlsOpen ? "open" : ""}`}>
          <div className="mobile-controls-inner">
            <div className="mobile-controls-block">
              <div className="mobile-controls-label">Search</div>
              <div className="cmd-search">
                <span className="icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
                  </svg>
                </span>
                <input placeholder="Search titles or panellists…" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
            </div>
            <div className="mobile-controls-block">
              <div className="mobile-controls-label">Theme</div>
              <button
                className="mobile-theme-toggle"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" /></svg>
                )}
                <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
              </button>
            </div>
            <div className="mobile-controls-grid">
              <div className="mobile-controls-block">
                <div className="mobile-controls-label">Panellist</div>
                <div className="cmd-select">
                  <select value={panellistFilter} onChange={(e) => setPanellistFilter(e.target.value)}>
                    <option value="">All panellists</option>
                    {allPanellists.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              {view !== "panellists" && (
                <div className="mobile-controls-block">
                  <div className="mobile-controls-label">Episode</div>
                  <div className="cmd-select">
                    <select value={episodeFilter} onChange={(e) => setEpisodeFilter(e.target.value)}>
                      <option value="">All episodes</option>
                      {episodes.map((ep) => (
                        <option key={ep} value={ep}>{HU.episodeLabel(Number.isNaN(Number(ep)) ? ep : Number(ep))}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              {view !== "panellists" && (
                <div className="mobile-controls-block">
                  <div className="mobile-controls-label">Sort</div>
                  <div className="cmd-select">
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <option value="episode-desc">Latest episodes</option>
                      <option value="episode-asc">Oldest episodes</option>
                      <option value="panellist">By panellist</option>
                      <option value="type">By type</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            {view !== "panellists" && (
              <div className="mobile-controls-block mobile-type-strip">
                <div className="mobile-controls-label">Format</div>
                <TypeStrip counts={typeCounts} active={typeFilter} onToggle={(t) => setTypeFilter(typeFilter === t ? "" : t)} />
              </div>
            )}
            <div className="mobile-controls-block mobile-active-filters">
              <Chips filters={{ q, panellist: panellistFilter, episode: episodeFilter, type: typeFilter }} onClear={clear} />
            </div>
          </div>
        </div>
      </div>

      <div className="desktop-filter-strip">
        {view !== "panellists" && <TypeStrip counts={typeCounts} active={typeFilter} onToggle={(t) => setTypeFilter(typeFilter === t ? "" : t)} />}
        <Chips filters={{ q, panellist: panellistFilter, episode: episodeFilter, type: typeFilter }} onClear={clear} />
      </div>

      <main className="main">
        {currentItems.length === 0 ? (
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
                  onEpisodeClick={openEpisodeFilter}
                />
              );
            })}
          </div>
        ) : view === "panellists" ? (
          <section className="panellists-page">
            <div className="panellists-page-head">
              <div className="panellists-page-kicker">Directory</div>
              <h2>Every recurring and guest voice, arranged as an editorial wall of contributors.</h2>
              <p>
                Open any profile for a larger portrait, a longer bio, and a full recommendation trail across Hafta episodes.
              </p>
            </div>
            <div className="panellists-grid">
              {visibleItems.map((panelist) => (
                <PanellistCard
                  key={panelist.name}
                  panelist={panelist}
                  query={q}
                  onOpen={(name) => setModalName(name)}
                />
              ))}
            </div>
          </section>
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
        {currentItems.length > 0 && (
          <div className="pagination-status" aria-live="polite">
            <span>
              Showing {Math.min(visibleCount, currentItems.length)} of {currentItems.length} {view === "cards" ? "results" : view === "episodes" ? "episodes" : "panellists"}
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
          onEpisodeClick={openEpisodeFilter}
        />
      )}
    </div>
  );
}

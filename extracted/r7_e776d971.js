// Root app — masthead, command bar, view switcher with variations + tweaks
const { useState: useS, useEffect: useE, useMemo: useM, useRef: useR } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "version": "v1-editorial",
  "redAccent": "#E8332E",
  "showStagger": true,
  "denseHeader": false
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply tweakable accent
  useE(() => {
    document.documentElement.style.setProperty("--red", t.redAccent || "#E8332E");
  }, [t.redAccent]);

  // Build canonical recs
  const allRecs = useM(() => {
    return window.RAW.map(([episode, panellist, title, type, siteHint]) => ({
      episode, panellist, title, type, siteHint: siteHint || null,
    }));
  }, []);

  const [q, setQ] = useS("");
  const [panellistFilter, setPanellistFilter] = useS("");
  const [episodeFilter, setEpisodeFilter] = useS("");
  const [typeFilter, setTypeFilter] = useS("");
  const [sortBy, setSortBy] = useS("episode-desc");
  const [view, setView] = useS("cards"); // cards | episodes (only meaningful for v1)
  const [modalName, setModalName] = useS(null);
  const [openWatch, setOpenWatch] = useS(null);
  const searchRef = useR(null);

  // Keyboard shortcut
  useE(() => {
    const onKey = (e) => {
      if (e.key === "/" && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current && searchRef.current.focus();
      } else if (e.key === "Escape") {
        if (modalName) return;
        if (document.activeElement === searchRef.current) searchRef.current.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalName]);

  const filtered = useM(() => {
    const qn = q.trim().toLowerCase();
    return allRecs.filter((r) => {
      if (typeFilter && r.type !== typeFilter) return false;
      if (panellistFilter && r.panellist !== panellistFilter) return false;
      if (episodeFilter && HU.episodeKey(r.episode) !== episodeFilter) return false;
      if (qn) {
        const hay = (r.title + " " + r.panellist).toLowerCase();
        if (!hay.includes(qn)) return false;
      }
      return true;
    });
  }, [allRecs, q, panellistFilter, episodeFilter, typeFilter]);

  const sorted = useM(() => {
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

  const typeCounts = useM(() => {
    const counts = {};
    const baseFiltered = allRecs.filter((r) => {
      if (panellistFilter && r.panellist !== panellistFilter) return false;
      if (episodeFilter && HU.episodeKey(r.episode) !== episodeFilter) return false;
      const qn = q.trim().toLowerCase();
      if (qn) {
        const hay = (r.title + " " + r.panellist).toLowerCase();
        if (!hay.includes(qn)) return false;
      }
      return true;
    });
    baseFiltered.forEach((r) => { counts[r.type] = (counts[r.type] || 0) + 1; });
    return counts;
  }, [allRecs, q, panellistFilter, episodeFilter]);

  const episodes = useM(() => {
    const set = new Set();
    allRecs.forEach((r) => set.add(HU.episodeKey(r.episode)));
    const list = [...set];
    list.sort((a, b) => {
      const an = !isNaN(Number(a));
      const bn = !isNaN(Number(b));
      if (an && bn) return Number(b) - Number(a);
      if (an) return 1;
      if (bn) return -1;
      return a.localeCompare(b);
    });
    return list;
  }, [allRecs]);

  const allPanellists = useM(() => {
    const set = new Set();
    allRecs.forEach((r) => set.add(r.panellist));
    return [...set].sort();
  }, [allRecs]);

  const grouped = useM(() => {
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

  const totalRecs = allRecs.length;
  const totalEpisodes = episodes.length;
  const totalPanellists = allPanellists.length;

  const clear = (key) => {
    if (key === "q") setQ("");
    if (key === "panellist") setPanellistFilter("");
    if (key === "episode") setEpisodeFilter("");
    if (key === "type") setTypeFilter("");
  };

  const isV1 = t.version === "v1-editorial";
  const isV2 = t.version === "v2-ledger";
  const isV3 = t.version === "v3-shelves";

  // Subtitle/header strings per version
  const versionMeta = {
    "v1-editorial": { tag: "Editorial Index", desc: "Hairline-bordered cards and grouped episode blocks. The masthead format." },
    "v2-ledger": { tag: "The Ledger", desc: "A single, scannable register of every recommendation. Like a printed back-of-issue index." },
    "v3-shelves": { tag: "Panellist Shelves", desc: "Each panellist as a vertical shelf — scroll horizontally across the room." },
  };
  const vmeta = versionMeta[t.version] || versionMeta["v1-editorial"];

  return (
    <div data-screen-label="Hafta Recommendations">
      {/* MASTHEAD */}
      <header className="masthead">
        <div className="masthead-inner" style={t.denseHeader ? { padding: "16px 32px 14px" } : undefined}>
          <div>
            <div className="pretitle">
              <span className="dot"></span>
              Newslaundry · Hafta · Recommendations · <span style={{ color: "var(--ink)" }}>{vmeta.tag}</span>
            </div>
            <h1 className="wordmark" style={t.denseHeader ? { fontSize: 44, marginBottom: 10 } : undefined}>
              Hafta<span className="slash"> / </span><span className="accent">Recommendations</span>
            </h1>
            <p className="lede">
              <em style={{ fontFamily: "var(--font-serif)", color: "var(--red)", fontWeight: 600 }}>{vmeta.tag}.</em>{" "}
              {vmeta.desc} Books route to <span className="key">Goodreads</span>, films to{" "}
              <span className="key">IMDb</span>, podcasts to <span className="key">Apple Podcasts</span>,
              articles to a publisher search. Press <span className="key">/</span> to search,
              <span className="arrow"> </span>or click any panellist to read their full history.
            </p>
          </div>
          <div className="stats-strip">
            <div className="stat"><div className="num">{totalRecs}</div><div className="lab">Recs</div></div>
            <div className="stat"><div className="num">{totalEpisodes}</div><div className="lab">Episodes</div></div>
            <div className="stat"><div className="num">{totalPanellists}</div><div className="lab">Panellists</div></div>
          </div>
        </div>
      </header>

      {/* COMMAND BAR */}
      <div className="cmd-bar">
        <div className="cmd-inner">
          <div className="cmd-search">
            <span className="icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
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
                <option key={ep} value={ep}>{HU.episodeLabel(isNaN(Number(ep)) ? ep : Number(ep))}</option>
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
          {isV1 && (
            <div className="view-toggle">
              <button className={view === "cards" ? "active" : ""} onClick={() => setView("cards")}>Cards</button>
              <button className={view === "episodes" ? "active" : ""} onClick={() => setView("episodes")}>Episodes</button>
            </div>
          )}
        </div>
      </div>

      <TypeStrip counts={typeCounts} active={typeFilter} onToggle={(t) => setTypeFilter(typeFilter === t ? "" : t)} />
      <Chips filters={{ q, panellist: panellistFilter, episode: episodeFilter, type: typeFilter }} onClear={clear} />

      {/* MAIN */}
      <main className="main" style={isV3 ? { maxWidth: "100%", padding: "22px 0 60px" } : undefined}>
        {sorted.length === 0 ? (
          <div className="empty">
            <div className="h">No matches</div>
            <div className="sub">Try clearing a filter, or search for a different name</div>
          </div>
        ) : isV1 ? (
          view === "cards" ? (
            <div className="cards-grid">
              {sorted.map((r, i) => {
                const featured = (i % 7 === 0) && i > 0;
                const full = (i % 13 === 0) && i > 0;
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
              {grouped.map((g) => (
                <EpisodeBlock
                  key={HU.episodeKey(g.episode)}
                  episode={g.episode}
                  recs={g.recs}
                  query={q}
                  watchOpen={openWatch === HU.episodeKey(g.episode)}
                  onWatchToggle={(ep) => {
                    const k = HU.episodeKey(ep);
                    setOpenWatch(openWatch === k ? null : k);
                  }}
                  onPanellistClick={(n) => setModalName(n)}
                />
              ))}
            </div>
          )
        ) : isV2 ? (
          <LedgerView
            recs={sorted}
            query={q}
            sortBy={sortBy}
            onPanellistClick={(n) => setModalName(n)}
            onEpisodeClick={(ep) => setEpisodeFilter(HU.episodeKey(ep))}
          />
        ) : (
          <ShelvesView
            recs={sorted}
            allRecs={allRecs}
            query={q}
            onPanellistClick={(n) => setModalName(n)}
            onEpisodeClick={(ep) => setEpisodeFilter(HU.episodeKey(ep))}
          />
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

      {/* TWEAKS PANEL */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Version" />
        <TweakRadio
          label="Layout"
          value={t.version}
          options={[
            { value: "v1-editorial", label: "Editorial" },
            { value: "v2-ledger", label: "Ledger" },
            { value: "v3-shelves", label: "Shelves" },
          ]}
          onChange={(v) => setTweak("version", v)}
        />
        <div style={{ fontSize: 10.5, lineHeight: 1.5, color: "rgba(41,38,27,.6)", padding: "2px 0 6px" }}>
          {vmeta.desc}
        </div>
        <TweakSection label="Brand" />
        <TweakColor
          label="Red accent"
          value={t.redAccent}
          onChange={(v) => setTweak("redAccent", v)}
        />
        <TweakSection label="Masthead" />
        <TweakToggle
          label="Compact header"
          value={t.denseHeader}
          onChange={(v) => setTweak("denseHeader", v)}
        />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

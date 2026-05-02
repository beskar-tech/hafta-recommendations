// Variations: Ledger view (v2) and Shelves view (v3)

// ---------- LEDGER VIEW ----------
function LedgerView({ recs, query, onPanellistClick, onEpisodeClick, sortBy }) {
  // Group by episode visually — show episode header inline (new-ep marker on first row of each ep)
  // Only meaningful when sorted by episode; otherwise rows just stream.
  const groupByEpisode = sortBy === "episode-desc" || sortBy === "episode-asc";
  let lastEp = null;
  return (
    <div className="ledger">
      <div className="ledger-head">
        <div>Episode</div>
        <div>Type</div>
        <div>Title</div>
        <div>Panellist</div>
        <div style={{ textAlign: "right" }}>Routes</div>
      </div>
      {recs.map((r, i) => {
        const k = HU.episodeKey(r.episode);
        const isNew = groupByEpisode && k !== lastEp;
        lastEp = k;
        const routes = buildRoutes(r.title, r.type, r.siteHint);
        return (
          <div key={i} className={`ledger-row ${isNew ? "new-ep" : ""}`}>
            <div className="l-ep">
              <button
                onClick={() => onEpisodeClick(r.episode)}
                style={{ background: "none", border: "none", padding: 0, color: "inherit", font: "inherit", cursor: "pointer" }}
              >
                {isNew ? (typeof r.episode === "number" ? `№ ${r.episode}` : r.episode) : ""}
              </button>
            </div>
            <div className="l-type">{typeLabel(r.type)}</div>
            <a className="l-title" href={routes.primary.url} target="_blank" rel="noopener">
              <HText text={r.title} q={query} />
            </a>
            <button className="l-panel" onClick={() => onPanellistClick(r.panellist)}>
              <Avatar name={r.panellist} size="sm" />
              <HText text={r.panellist} q={query} />
            </button>
            <div className="l-actions">
              <a href={routes.primary.url} target="_blank" rel="noopener">{routes.primary.label.split(" ")[0]}</a>
              {routes.secondary.slice(0, 2).map((s, k) => (
                <a key={k} href={s.url} target="_blank" rel="noopener">{s.label.split(" ")[0]}</a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- SHELVES VIEW ----------
function ShelvesView({ recs, allRecs, query, onPanellistClick, onEpisodeClick }) {
  // Group by panellist; sort panellists by total recs in full set (regulars first)
  const byPanellist = new Map();
  recs.forEach((r) => {
    if (!byPanellist.has(r.panellist)) byPanellist.set(r.panellist, []);
    byPanellist.get(r.panellist).push(r);
  });
  const totalsAll = new Map();
  allRecs.forEach((r) => {
    totalsAll.set(r.panellist, (totalsAll.get(r.panellist) || 0) + 1);
  });
  const shelves = [...byPanellist.entries()].sort((a, b) => {
    return (totalsAll.get(b[0]) || 0) - (totalsAll.get(a[0]) || 0);
  });

  return (
    <>
      <div className="shelves-hint">
        <span>Each panellist a shelf · {shelves.length} panellists shown</span>
        <span><span className="arrow">→</span> Scroll horizontally</span>
      </div>
      <div className="shelves-wrap">
        <div className="shelves">
          {shelves.map(([name, items]) => {
            const meta = (window.PANELLISTS && window.PANELLISTS[name]) || { role: "Guest contributor" };
            const eps = [...new Set(items.map((r) => HU.episodeKey(r.episode)))];
            // Sort items latest-first
            const sortedItems = [...items].sort((a, b) => {
              const an = typeof a.episode === "number";
              const bn = typeof b.episode === "number";
              if (an && bn) return b.episode - a.episode;
              if (an) return 1;
              if (bn) return -1;
              return 0;
            });
            return (
              <div className="shelf" key={name}>
                <div className="shelf-head" onClick={() => onPanellistClick(name)}>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <Avatar name={name} size="lg" />
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div className="shelf-name"><HText text={name} q={query} /></div>
                      <div className="shelf-role">{meta.role}</div>
                    </div>
                  </div>
                  <div className="shelf-meta">
                    <span><strong>{items.length}</strong> recs</span>
                    <span><strong>{eps.length}</strong> eps</span>
                    <span style={{ color: "var(--red)" }}>view profile →</span>
                  </div>
                </div>
                <div className="shelf-list">
                  {sortedItems.length === 0 ? (
                    <div className="shelf-empty">— no picks in current filter —</div>
                  ) : (
                    sortedItems.map((r, i) => {
                      const routes = buildRoutes(r.title, r.type, r.siteHint);
                      return (
                        <div className="shelf-item" key={i}>
                          <div className="si-top">
                            <button className="si-ep" onClick={() => onEpisodeClick(r.episode)}>
                              {HU.episodeShort(r.episode)}
                            </button>
                            <span className="si-type">{typeLabel(r.type)}</span>
                          </div>
                          <a className="si-title" href={routes.primary.url} target="_blank" rel="noopener">
                            <HText text={r.title} q={query} />
                          </a>
                          <div className="si-actions">
                            <a href={routes.primary.url} target="_blank" rel="noopener">{routes.primary.label.split(" ")[0]}</a>
                            {routes.secondary.slice(0, 2).map((s, k) => (
                              <a key={k} href={s.url} target="_blank" rel="noopener">{s.label.split(" ")[0]}</a>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

Object.assign(window, { LedgerView, ShelvesView });

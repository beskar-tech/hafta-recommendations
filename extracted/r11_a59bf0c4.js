// Episodes view + Modal
const { useState: useState2, useEffect: useEffect2, useMemo: useMemo2 } = React;

// ---------- EPISODE BLOCK ----------
function EpisodeBlock({ episode, recs, watchOpen, onWatchToggle, onPanellistClick, query }) {
  const isSpecial = typeof episode !== "number";
  const panellists = [...new Set(recs.map((r) => r.panellist))];
  // Group by panellist preserving first-seen order
  const byPanellist = panellists.map((p) => ({
    panellist: p,
    recs: recs.filter((r) => r.panellist === p),
  }));
  const searchTerm = encodeURIComponent(`Newslaundry Hafta ${episode}`);
  const embedUrl = `https://www.youtube.com/embed?listType=search&list=${searchTerm}`;

  return (
    <section className="episode-block">
      <header className="episode-head">
        <div className={`episode-num ${isSpecial ? "special" : ""}`}>
          {isSpecial ? episode : episode}
        </div>
        <div className="episode-meta">
          <strong>{recs.length}</strong> recs
          <span className="sep">·</span>
          <strong>{panellists.length}</strong> panellists
          <span className="sep">·</span>
          {isSpecial ? "Special episode" : "Hafta"}
        </div>
        <button
          className={`btn-watch ${watchOpen ? "open" : ""}`}
          onClick={() => onWatchToggle(episode)}
        >
          {watchOpen ? "▾ Close player" : "▸ Watch episode"}
        </button>
      </header>
      {watchOpen && (
        <div className="embed-wrap">
          <div className="embed-aspect">
            <iframe
              src={embedUrl}
              title={`Newslaundry Hafta ${episode}`}
              allow="accelerometer; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
      <div className="episode-body">
        {byPanellist.map((row, i) => {
          const meta = (window.PANELLISTS && window.PANELLISTS[row.panellist]) || { role: "Guest contributor" };
          return (
            <React.Fragment key={i}>
              <div className="ep-panellist-cell">
                <div className="ep-pname" onClick={() => onPanellistClick(row.panellist)}>
                  <Avatar name={row.panellist} size="md" />
                  <HText text={row.panellist} q={query} />
                </div>
                <div className="ep-prole">{meta.role}</div>
                <button className="ep-pview" onClick={() => onPanellistClick(row.panellist)}>
                  View profile →
                </button>
              </div>
              <div className="ep-recs-cell">
                {row.recs.map((r, j) => {
                  const routes = buildRoutes(r.title, r.type, r.siteHint);
                  return (
                    <div className="ep-rec" key={j}>
                      <span className="ep-rec-num">{String(j + 1).padStart(2, "0")}</span>
                      <span className="ep-rec-type">{typeLabel(r.type)}</span>
                      <a className="ep-rec-title" href={routes.primary.url} target="_blank" rel="noopener">
                        <HText text={r.title} q={query} />
                      </a>
                      <span className="ep-rec-actions">
                        <a href={routes.primary.url} target="_blank" rel="noopener" title={routes.primary.label}>
                          {routes.primary.label.split(" ")[0]}
                        </a>
                        {routes.secondary.slice(0, 2).map((s, k) => (
                          <a key={k} href={s.url} target="_blank" rel="noopener" title={s.label}>
                            {s.label.split(" ")[0]}
                          </a>
                        ))}
                      </span>
                    </div>
                  );
                })}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}

// ---------- PANELLIST MODAL ----------
function PanellistModal({ name, allRecs, onClose, onEpisodeClick }) {
  useEffect2(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const meta = (window.PANELLISTS && window.PANELLISTS[name]) || { role: "Guest contributor", bio: null };
  const myRecs = allRecs.filter((r) => r.panellist === name);
  const episodesIn = [...new Set(myRecs.map((r) => HU.episodeKey(r.episode)))];
  // Sort latest-first: numeric desc, special first
  const sorted = [...myRecs].sort((a, b) => {
    const an = typeof a.episode === "number";
    const bn = typeof b.episode === "number";
    if (an && bn) return b.episode - a.episode;
    if (an) return 1;
    if (bn) return -1;
    return String(a.episode).localeCompare(String(b.episode));
  });
  // First-seen episode = oldest (smallest numeric, or any special)
  const firstSeen = (() => {
    const numerics = myRecs.filter((r) => typeof r.episode === "number").map((r) => r.episode);
    if (numerics.length) return `Hafta ${Math.min(...numerics)}`;
    return myRecs[0] ? HU.episodeLabel(myRecs[0].episode) : "—";
  })();

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <Avatar name={name} size="xl" />
          <div className="modal-head-text">
            <h2 className="modal-name">{name}</h2>
            <div className="modal-role">{meta.role}</div>
            {meta.bio ? (
              <p className="modal-bio">{meta.bio}</p>
            ) : (
              <p className="modal-bio placeholder">
                Guest contributor on Hafta. We don't have a verified public bio for this panellist; rather than fabricate one, we're leaving this blank.
              </p>
            )}
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close">×</button>
        </header>
        <div className="modal-stats">
          <div className="stat">
            <div className="num">{myRecs.length}</div>
            <div className="lab">Recommendations</div>
          </div>
          <div className="stat">
            <div className="num">{episodesIn.length}</div>
            <div className="lab">Episodes</div>
          </div>
          <div className="stat">
            <div className="num" style={{ fontSize: 18, lineHeight: 1.2 }}>{firstSeen}</div>
            <div className="lab">First seen</div>
          </div>
        </div>
        <div className="modal-section-rule">
          <span className="lab">Recommendation history</span>
        </div>
        <div className="modal-body">
          {sorted.map((r, i) => {
            const routes = buildRoutes(r.title, r.type, r.siteHint);
            return (
              <div className="history-row" key={i}>
                <button className="hep" onClick={() => onEpisodeClick(r.episode)}>
                  {HU.episodeShort(r.episode)}
                </button>
                <span className="htype">{typeLabel(r.type)}</span>
                <a className="htitle" href={routes.primary.url} target="_blank" rel="noopener">
                  {r.title}
                </a>
                <span className="hicons">
                  <a href={routes.primary.url} target="_blank" rel="noopener">{routes.primary.label.split(" ")[0]}</a>
                  {routes.secondary.slice(0, 2).map((s, k) => (
                    <a key={k} href={s.url} target="_blank" rel="noopener">{s.label.split(" ")[0]}</a>
                  ))}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { EpisodeBlock, PanellistModal });

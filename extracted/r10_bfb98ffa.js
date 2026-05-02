// Components: avatar, card, type pill, chips, modal, masthead, command bar, episodes view
const { useState, useEffect, useMemo, useRef, useCallback } = React;

// ---------- AVATAR ----------
function Avatar({ name, size = "md" }) {
  const c = HU.avatarColor(name);
  return (
    <span
      className={`avatar ${size}`}
      style={{ background: c.bg, color: c.fg }}
      aria-label={name}
    >
      {HU.initials(name)}
    </span>
  );
}

// ---------- HIGHLIGHTED TEXT ----------
function HText({ text, q }) {
  const segs = HU.highlight(text, q);
  return (
    <>
      {segs.map((s, i) =>
        s.hit ? <mark key={i} className="hit">{s.text}</mark> : <span key={i}>{s.text}</span>
      )}
    </>
  );
}

// ---------- TYPE BADGE ----------
function TypeBadge({ type }) {
  return <div className="type-badge">{typeLabel(type)}</div>;
}

// ---------- CARD ----------
function RecCard({ rec, query, onPanellistClick, onEpisodeClick, featured = false, full = false }) {
  const routes = buildRoutes(rec.title, rec.type, rec.siteHint);
  return (
    <article className={`card ${featured ? "feature" : ""} ${full ? "full" : ""}`}>
      <div className="card-top">
        <button className="episode-tag" onClick={() => onEpisodeClick(rec.episode)}>
          {HU.episodeShort(rec.episode)}
        </button>
        <button className="panellist-tab" onClick={() => onPanellistClick(rec.panellist)}>
          <span className="name"><HText text={rec.panellist} q={query} /></span>
          <Avatar name={rec.panellist} size="sm" />
        </button>
      </div>
      <TypeBadge type={rec.type} />
      <a className="card-title" href={routes.primary.url} target="_blank" rel="noopener">
        <HText text={rec.title} q={query} />
      </a>
      <div className="card-actions">
        <a className="btn-action primary" href={routes.primary.url} target="_blank" rel="noopener">
          {routes.primary.label}
        </a>
        {routes.secondary.map((s, i) => (
          <a key={i} className="btn-action" href={s.url} target="_blank" rel="noopener">
            {s.label}
          </a>
        ))}
      </div>
    </article>
  );
}

// ---------- TYPE STRIP ----------
function TypeStrip({ counts, active, onToggle }) {
  const types = ["article", "book", "film", "tvseries", "podcast", "video", "music", "report", "person"];
  return (
    <div className="type-strip">
      <div className="type-strip-inner">
        <span className="label">Filter by type</span>
        {types.map((t) => {
          const ct = counts[t] || 0;
          if (!ct) return null;
          const isActive = active === t;
          return (
            <button
              key={t}
              className={`type-pill ${isActive ? "active" : ""}`}
              onClick={() => onToggle(t)}
            >
              {typeLabel(t)} <span className="ct">{ct}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- CHIPS ----------
function Chips({ filters, onClear }) {
  const items = [];
  if (filters.q) items.push({ key: "q", label: `"${filters.q}"` });
  if (filters.panellist) items.push({ key: "panellist", label: filters.panellist });
  if (filters.episode) items.push({ key: "episode", label: HU.episodeLabel(filters.episode) });
  if (filters.type) items.push({ key: "type", label: typeLabel(filters.type) });
  if (!items.length) return null;
  return (
    <div className="chips">
      <span className="label">Active</span>
      {items.map((it) => (
        <span key={it.key} className="chip">
          {it.label}
          <button className="x" onClick={() => onClear(it.key)} aria-label={`Clear ${it.key}`}>×</button>
        </span>
      ))}
    </div>
  );
}

Object.assign(window, { Avatar, HText, TypeBadge, RecCard, TypeStrip, Chips });

import { useEffect, useState } from "react";
import { buildRoutes, typeLabel } from "./routes";
import { HU } from "./utils";

function usePanellistImage(name) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    let cancel = false;
    HU.fetchPersonImage(name).then((s) => {
      if (!cancel) setSrc(s);
    });
    return () => {
      cancel = true;
    };
  }, [name]);

  return src;
}

export function Avatar({ name, size = "md" }) {
  const c = HU.avatarColor(name);
  return (
    <span className={`avatar ${size}`} style={{ backgroundColor: c.bg, color: c.fg }} aria-label={name}>
      {HU.initials(name)}
    </span>
  );
}

export function PanellistAvatar({ name, size = "md" }) {
  const src = usePanellistImage(name);
  const c = HU.avatarColor(name);

  return (
    <span
      className={`avatar ${size} ${src ? "has-img" : ""}`}
      style={{ backgroundColor: c.bg, color: c.fg, backgroundImage: src ? `url("${src}")` : undefined }}
      aria-label={name}
    >
      {!src && HU.initials(name)}
    </span>
  );
}

export function PanellistCard({ panelist, query, onOpen }) {
  const src = usePanellistImage(panelist.name);

  return (
    <article className={`panellist-card ${src ? "has-portrait" : ""}`}>
      <button className="panellist-card-media" onClick={() => onOpen(panelist.name)} aria-label={`Open ${panelist.name}`}>
        {src ? (
          <span className="panellist-card-portrait" style={{ backgroundImage: `url("${src}")` }} aria-hidden="true" />
        ) : (
          <PanellistAvatar name={panelist.name} size="hero" />
        )}
      </button>
      <div className="panellist-card-body">
        <div className="panellist-card-topline">
          <span>{panelist.recommendationCount} recs</span>
          <span>{panelist.episodeCount} episodes</span>
        </div>
        <button className="panellist-card-name" onClick={() => onOpen(panelist.name)}>
          <HText text={panelist.name} q={query} />
        </button>
        <div className="panellist-card-role">{panelist.role}</div>
        <p className={`panellist-card-bio ${panelist.bio ? "" : "placeholder"}`}>
          {panelist.bio || "Guest contributor with a growing recommendation trail across Hafta episodes."}
        </p>
        <div className="panellist-card-meta">
          <span>First seen {panelist.firstSeen}</span>
          <span>Latest {panelist.latestSeen}</span>
        </div>
      </div>
    </article>
  );
}

export function HText({ text, q }) {
  const segs = HU.highlight(text, q);
  return (
    <>
      {segs.map((s, i) => (s.hit ? <mark key={i} className="hit">{s.text}</mark> : <span key={i}>{s.text}</span>))}
    </>
  );
}

export function TypeBadge({ type }) {
  return <div className="type-badge">{typeLabel(type)}</div>;
}

export function RecCard({ rec, query, onPanellistClick, onEpisodeClick, featured = false, full = false }) {
  const routes = buildRoutes(rec.title, rec.type, rec.siteHint, rec.sourceUrl, rec.sourceLabel);
  const [thumb, setThumb] = useState(null);

  useEffect(() => {
    let cancel = false;
    HU.fetchThumbnailFor(rec.title, rec.type).then((s) => {
      if (!cancel) setThumb(s);
    });
    return () => {
      cancel = true;
    };
  }, [rec.title, rec.type]);

  return (
    <article className={`card ${featured ? "feature" : ""} ${full ? "full" : ""} ${thumb ? "has-thumb" : ""}`}>
      {thumb && <div className="card-thumb" style={{ backgroundImage: `url("${thumb}")` }} aria-hidden="true"></div>}
      <div className="card-top-row">
        <button className="episode-tag" onClick={() => onEpisodeClick(rec.episode)}>
          {HU.episodeShort(rec.episode)}
        </button>
        <button className="panellist-tab" onClick={() => onPanellistClick(rec.panellist)}>
          <span className="name"><HText text={rec.panellist} q={query} /></span>
          <PanellistAvatar name={rec.panellist} size="sm" />
        </button>
      </div>
      <div className="card-overlay">
        <TypeBadge type={rec.type} />
        <a className="card-title" href={routes.primary.url} target="_blank" rel="noopener">
          <HText text={rec.title} q={query} />
        </a>
        <div className="card-actions">
          <a className="btn-action primary" href={routes.primary.url} target="_blank" rel="noopener">{routes.primary.label}</a>
          {routes.secondary.map((s, i) => (
            <a key={i} className="btn-action" href={s.url} target="_blank" rel="noopener">{s.label}</a>
          ))}
        </div>
      </div>
    </article>
  );
}

export function TypeStrip({ counts, active, onToggle }) {
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
            <button key={t} className={`type-pill ${isActive ? "active" : ""}`} onClick={() => onToggle(t)}>
              {typeLabel(t)} <span className="ct">{ct}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Chips({ filters, onClear }) {
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

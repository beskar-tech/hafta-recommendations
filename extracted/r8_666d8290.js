// Shared utilities: hashing, avatar colors, normalization
(function () {
  // Deterministic 32-bit hash
  function hash(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  // Avatar palette: tinted reds, warm earths, ink neutrals — derived from brand
  const AVATAR_PALETTE = [
    { bg: "#E8332E", fg: "#FFFFFF" }, // brand red
    { bg: "#A8211E", fg: "#FFFFFF" }, // deep red
    { bg: "#7A1A18", fg: "#FFFFFF" }, // ox blood
    { bg: "#C2553D", fg: "#FFFFFF" }, // terracotta
    { bg: "#8B5A3C", fg: "#FFFFFF" }, // walnut
    { bg: "#5C3A28", fg: "#FFFFFF" }, // earth brown
    { bg: "#2A2A2A", fg: "#FFFFFF" }, // ink
    { bg: "#3D3530", fg: "#FFFFFF" }, // warm ink
    { bg: "#FAF7F2", fg: "#1A1A1A" }, // cream (rare)
    { bg: "#D4B896", fg: "#1A1A1A" }, // warm sand
    { bg: "#9C6B4F", fg: "#FFFFFF" }, // umber
    { bg: "#6B4226", fg: "#FFFFFF" }, // chestnut
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

  // Highlight matched substring (returns array of {text, hit} segments)
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

  window.HU = { hash, avatarColor, initials, norm, episodeKey, episodeLabel, episodeShort, highlight };
})();

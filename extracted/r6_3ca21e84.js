// Type-aware routing for recommendations
// Each type has a primary destination and 2 secondary destinations.
// Returns { primary: {label, url}, secondary: [{label, url}, {label, url}] }

(function () {
  const enc = encodeURIComponent;

  function buildRoutes(title, type, siteHint) {
    const t = (type || "").toLowerCase();
    const q = enc(title);

    switch (t) {
      case "book":
        return {
          primary: { label: "GOODREADS", url: `https://www.goodreads.com/search?q=${q}` },
          secondary: [
            { label: "AMAZON", url: `https://www.amazon.in/s?k=${q}&i=stripbooks` },
            { label: "GOOGLE", url: `https://www.google.com/search?q=${q}+book` },
          ],
        };

      case "film":
      case "tvseries":
      case "tv":
      case "series":
        return {
          primary: { label: "IMDB", url: `https://www.imdb.com/find/?q=${q}&s=tt` },
          secondary: [
            { label: "YOUTUBE", url: `https://www.youtube.com/results?search_query=${q}+trailer` },
            { label: "GOOGLE", url: `https://www.google.com/search?q=${q}` },
          ],
        };

      case "podcast":
        return {
          primary: { label: "APPLE", url: `https://podcasts.apple.com/in/search?term=${q}` },
          secondary: [
            { label: "SPOTIFY", url: `https://open.spotify.com/search/${q}/podcasts` },
            { label: "YOUTUBE", url: `https://www.youtube.com/results?search_query=${q}+podcast` },
          ],
        };

      case "video":
        return {
          primary: { label: "YOUTUBE", url: `https://www.youtube.com/results?search_query=${q}` },
          secondary: [
            { label: "GOOGLE", url: `https://www.google.com/search?q=${q}` },
            { label: "DUCKDUCKGO", url: `https://duckduckgo.com/?q=${q}` },
          ],
        };

      case "music":
        return {
          primary: { label: "SPOTIFY", url: `https://open.spotify.com/search/${q}` },
          secondary: [
            { label: "YOUTUBE", url: `https://www.youtube.com/results?search_query=${q}` },
            { label: "APPLE MUSIC", url: `https://music.apple.com/in/search?term=${q}` },
          ],
        };

      case "article": {
        const primaryUrl = siteHint
          ? `https://www.google.com/search?q=site:${enc(siteHint)}+${q}`
          : `https://news.google.com/search?q=${q}`;
        return {
          primary: { label: siteHint ? `SEARCH ${siteHint.toUpperCase()}` : "GOOGLE NEWS", url: primaryUrl },
          secondary: [
            { label: "GOOGLE", url: `https://www.google.com/search?q=${q}` },
            { label: "DUCKDUCKGO", url: `https://duckduckgo.com/?q=${q}` },
          ],
        };
      }

      case "report":
        return {
          primary: { label: "GOOGLE PDF", url: `https://www.google.com/search?q=${q}+filetype:pdf` },
          secondary: [
            { label: "SCHOLAR", url: `https://scholar.google.com/scholar?q=${q}` },
            { label: "GOOGLE", url: `https://www.google.com/search?q=${q}` },
          ],
        };

      case "person":
        return {
          primary: { label: "WIKIPEDIA", url: `https://en.wikipedia.org/w/index.php?search=${q}` },
          secondary: [
            { label: "GOOGLE", url: `https://www.google.com/search?q=${q}` },
            { label: "NEWS", url: `https://news.google.com/search?q=${q}` },
          ],
        };

      default:
        return {
          primary: { label: "GOOGLE", url: `https://www.google.com/search?q=${q}` },
          secondary: [
            { label: "DUCKDUCKGO", url: `https://duckduckgo.com/?q=${q}` },
            { label: "WIKIPEDIA", url: `https://en.wikipedia.org/w/index.php?search=${q}` },
          ],
        };
    }
  }

  // Display label for type (singular, capitalized)
  function typeLabel(t) {
    const map = {
      article: "Article",
      book: "Book",
      film: "Film",
      tvseries: "TV / Series",
      podcast: "Podcast",
      video: "Video",
      music: "Music",
      report: "Report",
      person: "Person",
    };
    return map[t] || t;
  }

  window.buildRoutes = buildRoutes;
  window.typeLabel = typeLabel;
})();

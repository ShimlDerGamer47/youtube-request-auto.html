document.addEventListener("DOMContentLoaded", function () {
  const iframe = document.getElementById("lastYTVidId");
  const imgFallback = document.getElementById("lastYTVidFallbackId");
  let fallbackTimeout;

  function showThumbnail(videoId) {
    const ytThumb = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    imgFallback.src = ytThumb;
    imgFallback.style.removeProperty("display");
    iframe.style.display = "none";
    clearTimeout(fallbackTimeout);
  }

  function showGenericFallback() {
    const ytThumb =
      "https://img.youtube.com/vi/VIDEO_ID_NICHT_VERFUEGBAR/maxresdefault.jpg";
    imgFallback.src = ytThumb;
    imgFallback.style.removeProperty("display");
    iframe.style.display = "none";
    clearTimeout(fallbackTimeout);
  }

  function lastYouTubeVideoToken() {
    const params = new URLSearchParams(window.location.search);
    let channelId = params.get("channelId");
    const autoplay = params.get("autoplay") === "true";
    const muted = params.get("muted") === "true";

    if (!channelId) {
      console.warn("Keine 'channelId' Parameter in der URL gefunden.");
      showGenericFallback();
      return;
    }

    let apiURL;
    if (channelId.startsWith("@")) {
      apiURL = `https://decapi.me/youtube/latest_video?handle=${encodeURIComponent(
        channelId
      )}`;
    } else {
      apiURL = `https://decapi.me/youtube/latest_video?id=${encodeURIComponent(
        channelId
      )}`;
    }

    fetch(apiURL)
      .then((res) => {
        if (!res.ok)
          throw new Error(
            `API-Request fehlgeschlagen mit Status ${res.status}`
          );
        return res.text();
      })
      .then((text) => {
        const regex = /(?:youtu\.be\/|watch\?v=)([A-Za-z0-9_-]{11})/;
        const match = text.match(regex);

        if (!match) {
          console.error(
            "Konnte keine videoId in der API-Antwort finden:",
            text
          );
          showGenericFallback();
          return;
        }

        const videoId = match[1];
        const autoParam = autoplay ? "1" : "0";
        const muteParam = muted ? "1" : "0";
        const embedURL = `https://www.youtube.com/embed/${videoId}?autoplay=${autoParam}&mute=${muteParam}`;

        imgFallback.style.display = "none";
        iframe.style.removeProperty("display");

        iframe.onload = () => {
          clearTimeout(fallbackTimeout);
        };

        iframe.src = embedURL;

        fallbackTimeout = setTimeout(() => {
          console.warn(
            "Iframe hat nicht reagiert – zeige Thumbnail stattdessen."
          );
          showThumbnail(videoId);
        }, 10000);
      })
      .catch((err) => {
        console.error("Fehler beim Laden des letzten YouTube-Videos:", err);
        showGenericFallback();
      });
  }

  lastYouTubeVideoToken();
});

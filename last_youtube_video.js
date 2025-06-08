document.addEventListener("DOMContentLoaded", function () {
  const lastYTVid = document.getElementById("lastYTVidId");

  const params = new URLSearchParams(window.location.search);
  const channelId = params.get("channelId");

  if (!channelId || channelId.trim() === "") {
    console.warn("Keine 'channelId' Parameter in der URL gefunden.");
    return;
  }

  let autoplay = localStorage.getItem("autoplay");
  if (params.has("autoplay")) {
    const val = params.get("autoplay");
    autoplay = val === "true" || val === "1";
    localStorage.setItem("autoplay", autoplay);
  } else if (autoplay !== null) {
    autoplay = autoplay === "true" || autoplay === "1";
  } else {
    autoplay = false;
    localStorage.setItem("autoplay", autoplay);
  }

  let muted = localStorage.getItem("muted");
  if (params.has("muted")) {
    const val = params.get("muted");
    muted = val === "true" || val === "1";
    localStorage.setItem("muted", muted);
  } else if (muted !== null) {
    muted = muted === "true" || muted === "1";
  } else {
    muted = true;
    localStorage.setItem("muted", muted);
  }

  if (autoplay && !muted) {
    console.warn(
      "Autoplay ohne Ton wird blockiert. 'muted' wird auf true gesetzt."
    );
    muted = true;
    localStorage.setItem("muted", muted);
  }

  const apiURL = channelId.startsWith("@")
    ? `https://decapi.me/youtube/latest_video?handle=${encodeURIComponent(
        channelId
      )}`
    : `https://decapi.me/youtube/latest_video?id=${encodeURIComponent(
        channelId
      )}`;

  fetch(apiURL)
    .then((res) => {
      if (!res.ok)
        throw new Error(`API-Request fehlgeschlagen mit Status ${res.status}`);
      return res.text();
    })
    .then((text) => {
      const regex = /(?:youtu\.be\/|watch\?v=)([A-Za-z0-9_-]{11})/;
      const match = text.match(regex);
      if (!match || !match[1]) {
        console.error("Konnte keine videoId finden:", text);
        return;
      }

      const videoId = match[1];
      const embedURL = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay}&mute=${muted}`;
      lastYTVid.src = embedURL;
    })
    .catch((error) => {
      console.error("Fehler beim Laden des letzten YouTube-Videos:", error);
    });
});

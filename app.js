const $ = (id) => document.getElementById(id);
const mount = $("mediaMount");
let currentMedia = null, objectUrl = null, deferredInstall = null;

function setTrack(type, title, subtitle) {
  $("trackType").textContent = type.toUpperCase();
  $("trackTitle").textContent = title;
  $("trackSubtitle").textContent = subtitle || "";
  $("playbackStatus").textContent = "Conteúdo carregado";
}
function youtubeId(input) {
  const value = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;
  try {
    const u = new URL(value);
    if (u.hostname === "youtu.be" || u.hostname.endsWith(".youtu.be")) return u.pathname.split("/").filter(Boolean)[0] || null;
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const parts = u.pathname.split("/").filter(Boolean);
      if (["embed","shorts","live"].includes(parts[0])) return parts[1] || null;
    }
  } catch {}
  return null;
}
function loadYoutube() {
  const id = youtubeId($("youtubeUrl").value);
  if (!id || !/^[\w-]{11}$/.test(id)) { alert("Não consegui identificar o vídeo. Cole um link válido do YouTube."); return; }
  stopCurrent();
  const iframe = document.createElement("iframe");
  iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?enablejsapi=1&playsinline=1&rel=0`;
  iframe.title = "Player oficial do YouTube";
  iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  mount.replaceChildren(iframe);
  currentMedia = null;
  $("audioControls").hidden = true;
  setTrack("YouTube • player oficial", "Vídeo do YouTube", "Use os controles do player oficial para assistir.");
  $("playbackStatus").textContent = "YouTube incorporado — sem segundo plano";
}
function stopCurrent() {
  if (currentMedia) { currentMedia.pause(); currentMedia.removeAttribute("src"); currentMedia.load(); }
  currentMedia = null;
  if (objectUrl) { URL.revokeObjectURL(objectUrl); objectUrl = null; }
}
function setupMedia(media, title, type) {
  stopCurrent();
  currentMedia = media;
  media.preload = "metadata";
  media.controls = false;
  media.playsInline = true;
  media.addEventListener("loadedmetadata", updateDuration, {once:true});
  media.addEventListener("timeupdate", updateProgress);
  media.addEventListener("play", () => { $("playPause").textContent = "Ⅱ"; $("playbackStatus").textContent = "Reproduzindo"; if (navigator.mediaSession) navigator.mediaSession.playbackState = "playing"; });
  media.addEventListener("pause", () => { $("playPause").textContent = "▶"; $("playbackStatus").textContent = "Pausado"; if (navigator.mediaSession) navigator.mediaSession.playbackState = "paused"; });
  media.addEventListener("error", () => { $("playbackStatus").textContent = "Não foi possível reproduzir (formato, bloqueio do site ou link inválido)"; });
  media.addEventListener("ended", () => { $("playbackStatus").textContent = "Reprodução concluída"; });
  mount.replaceChildren(media);
  $("audioControls").hidden = false;
  setTrack(type, title, "Conteúdo fornecido pelo usuário.");
  $("playPause").onclick = () => currentMedia && (currentMedia.paused ? currentMedia.play() : currentMedia.pause());
  $("muteBtn").onclick = () => { if (!currentMedia) return; currentMedia.muted = !currentMedia.muted; $("muteBtn").textContent = currentMedia.muted ? "MUDO" : "◖))"; };
  $("seek").oninput = (e) => { if (currentMedia && Number.isFinite(currentMedia.duration)) currentMedia.currentTime = currentMedia.duration * Number(e.target.value) / 1000; };
  setupMediaSession(title);
  media.play().catch(() => { $("playbackStatus").textContent = "Toque em reproduzir para iniciar"; });
}
function loadDirectUrl() {
  const url = $("mediaUrl").value.trim();
  if (!/^https?:\/\//i.test(url)) { alert("Informe uma URL HTTPS ou HTTP direta para um arquivo de áudio/vídeo."); return; }
  const path = new URL(url).pathname.toLowerCase();
  const isAudio = /\.(mp3|m4a|aac|ogg|opus|wav|flac)(\?.*)?$/.test(path);
  const isVideo = /\.(mp4|webm|ogv|mov)(\?.*)?$/.test(path);
  if (!isAudio && !isVideo) { alert("A URL deve apontar diretamente para um arquivo de mídia compatível (por exemplo .mp3, .m4a, .mp4 ou .webm)."); return; }
  const el = document.createElement(isAudio ? "audio" : "video");
  el.src = url;
  if (isVideo) el.controls = true;
  setupMedia(el, decodeURIComponent(path.split("/").pop()) || "Mídia online", isAudio ? "Áudio online" : "Vídeo online");
}
function updateDuration() { if (!currentMedia) return; $("duration").textContent = fmt(currentMedia.duration); }
function updateProgress() {
  if (!currentMedia) return;
  $("elapsed").textContent = fmt(currentMedia.currentTime);
  if (Number.isFinite(currentMedia.duration) && currentMedia.duration > 0) $("seek").value = Math.round(currentMedia.currentTime/currentMedia.duration*1000);
}
function fmt(n) { if (!Number.isFinite(n)) return "00:00"; const s=Math.floor(n); return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`; }
function setupMediaSession(title) {
  if (!("mediaSession" in navigator)) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({title, artist:"NEXTPLAY", album:"Sua biblioteca"});
    navigator.mediaSession.setActionHandler("play", () => currentMedia?.play());
    navigator.mediaSession.setActionHandler("pause", () => currentMedia?.pause());
    navigator.mediaSession.setActionHandler("seekbackward", () => { if(currentMedia) currentMedia.currentTime=Math.max(0,currentMedia.currentTime-10); });
    navigator.mediaSession.setActionHandler("seekforward", () => { if(currentMedia) currentMedia.currentTime=Math.min(currentMedia.duration||Infinity,currentMedia.currentTime+10); });
    navigator.mediaSession.setActionHandler("seekto", (d) => { if(currentMedia && Number.isFinite(d.seekTime)) currentMedia.currentTime=d.seekTime; });
  } catch {}
}
$("loadYoutube").addEventListener("click", loadYoutube);
$("youtubeUrl").addEventListener("keydown", e => { if(e.key==="Enter") loadYoutube(); });
$("loadUrl").addEventListener("click", loadDirectUrl);
$("mediaUrl").addEventListener("keydown", e => { if(e.key==="Enter") loadDirectUrl(); });
$("fileInput").addEventListener("change", e => {
  const file=e.target.files?.[0]; if(!file) return;
  stopCurrent(); objectUrl=URL.createObjectURL(file);
  const isAudio=file.type ? file.type.startsWith("audio/") : /\.(mp3|m4a|aac|ogg|opus|wav|flac)$/i.test(file.name);
  const el=document.createElement(isAudio?"audio":"video");
  el.src=objectUrl; if(!isAudio) el.controls=true;
  setupMedia(el,file.name,isAudio?"Arquivo de áudio":"Arquivo de vídeo");
  e.target.value="";
});
$("goPlayer").addEventListener("click", () => $("player").scrollIntoView({behavior:"smooth"}));
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredInstall=e; $("installBtn").hidden=false; });
$("installBtn").addEventListener("click", async () => { if(!deferredInstall) return; deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall=null; $("installBtn").hidden=true; });
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(()=>{}));

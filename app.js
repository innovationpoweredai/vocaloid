const API = "https://facilities-ocean-silence-code.trycloudflare.com";

let loop = false;
let currentFolder = [];

// ================= PLAY =================
async function play() {
  const input = document.getElementById("song").value;

  if (!input) return;

  // 🎵 Detect YouTube Playlist
  if (input.includes("list=")) {
    await playYouTubePlaylist(input);
    return;
  }

  // Normal song
  sendToBot(input);
}

// ================= SEND =================
function sendToBot(link) {
  fetch(`${API}/play`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ query: link })
  });
}

// ================= PLAYLIST HANDLER =================
async function playYouTubePlaylist(url) {
  try {
    // Use noembed trick (lightweight)
    const res = await fetch(`https://noembed.com/embed?url=${url}`);
    const data = await res.json();

    alert("Playlist detected — adding songs...");

    // Fallback: just send playlist link
    // Backend will still handle entries if yt-dlp supports
    sendToBot(url);

  } catch {
    alert("Playlist fallback mode");
    sendToBot(url);
  }
}

// ================= TITLE CLEAN =================
function cleanTitle(url) {
  try {
    return decodeURIComponent(url.split("v=")[1] || url).slice(0, 40);
  } catch {
    return url.slice(0, 40);
  }
}

// ================= FOLDER SYSTEM =================
function createFolder() {
  const name = document.getElementById("folderName").value;

  if (!name) return;

  let folders = JSON.parse(localStorage.getItem("folders") || "{}");

  folders[name] = [];
  localStorage.setItem("folders", JSON.stringify(folders));

  loadFolders();
}

function addToFolder(folder) {
  const link = prompt("Enter link:");
  if (!link) return;

  let folders = JSON.parse(localStorage.getItem("folders"));

  folders[folder].push(link);

  localStorage.setItem("folders", JSON.stringify(folders));
  loadFolders();
}

function playFolder(folder) {
  let folders = JSON.parse(localStorage.getItem("folders"));

  currentFolder = folders[folder];

  currentFolder.forEach(link => sendToBot(link));
}

// ================= LOOP =================
function toggleLoop() {
  loop = !loop;
  alert("Loop: " + (loop ? "ON" : "OFF"));
}

// ================= LOAD UI =================
function loadFolders() {
  let folders = JSON.parse(localStorage.getItem("folders") || {});
  const div = document.getElementById("folders");

  div.innerHTML = "";

  Object.keys(folders).forEach(name => {
    const el = document.createElement("div");

    el.innerHTML = `
      <b>${name}</b>
      <button onclick="addToFolder('${name}')">➕</button>
      <button onclick="playFolder('${name}')">▶</button>
    `;

    div.appendChild(el);
  });
}

// ================= QUEUE DISPLAY =================
setInterval(() => {
  fetch(`${API}/queue`)
    .then(res => res.json())
    .then(data => {

      document.getElementById("now").innerText =
        data.current ? cleanTitle(data.current) : "Nothing";

      const q = document.getElementById("queue");
      q.innerHTML = "";

      data.queue.forEach((song, i) => {
        const li = document.createElement("li");
        li.innerText = `${i + 1}. ${cleanTitle(song)}`;
        q.appendChild(li);
      });

      // 🔁 AUTO LOOP
      if (loop && data.queue.length === 0 && currentFolder.length > 0) {
        currentFolder.forEach(link => sendToBot(link));
      }

    });
}, 2000);

// Init
loadFolders();

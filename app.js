const API = "https://surge-priority-layout-bags.trycloudflare.com";

let loop = false;
let currentFolder = [];

// PLAY
function play() {
  const song = document.getElementById("song").value;
  fetch(`${API}/play`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ query: song })
  });
}

// CONTROLS
function pause(){ fetch(`${API}/pause`, {method:"POST"}); }
function resume(){ fetch(`${API}/resume`, {method:"POST"}); }
function skip(){ fetch(`${API}/skip`, {method:"POST"}); }

// FOLDER SYSTEM
function createFolder() {
  const name = document.getElementById("folderName").value;
  if (!name) return;

  👉 let folders = JSON.parse(localStorage.getItem("folders") || "{}");

  if (folders[name]) return alert("Exists");

  folders[name] = [];
  localStorage.setItem("folders", JSON.stringify(folders));

  loadFolders();
}

function addToFolder(folder) {
  const link = prompt("Enter link");
  if (!link) return;

  let folders = JSON.parse(localStorage.getItem("folders") || "{}");
  folders[folder].push(link);

  localStorage.setItem("folders", JSON.stringify(folders));
  loadFolders();
}

function playFolder(folder) {
  let folders = JSON.parse(localStorage.getItem("folders"));
  currentFolder = folders[folder];

  currentFolder.forEach(link => {
    fetch(`${API}/play`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ query: link })
    });
  });
}

function loadFolders() {
  let folders = JSON.parse(localStorage.getItem("folders") || {});
  const div = document.getElementById("folders");
  div.innerHTML = "";

  Object.keys(folders).forEach(name => {
    const el = document.createElement("div");
    el.className = "folder";

    el.innerHTML = `
      <b>${name}</b><br>
      <button onclick="addToFolder('${name}')">Add</button>
      <button onclick="playFolder('${name}')">Play</button>
    `;

    div.appendChild(el);
  });
}

// LOOP
function toggleLoop() {
  loop = !loop;
  alert("Loop: " + loop);
}

// QUEUE
setInterval(() => {
  fetch(`${API}/queue`)
    .then(r => r.json())
    .then(data => {
      document.getElementById("now").innerText = data.current || "Nothing";

      const q = document.getElementById("queue");
      q.innerHTML = "";

      data.queue.forEach(song => {
        const li = document.createElement("li");
        li.innerText = song;
        q.appendChild(li);
      });

      if (loop && data.queue.length === 0 && currentFolder.length > 0) {
        currentFolder.forEach(link => play(link));
      }
    });
}, 2000);

loadFolders();

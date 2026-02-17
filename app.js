const API = "https://inquiry-jungle-carlos-ipaq.trycloudflare.com";

// ▶ PLAY
function play() {
  const song = document.getElementById("song").value;

  if (!song) {
    alert("Please enter a song link");
    return;
  }

  fetch(`${API}/play`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query: song })
  });
}

// ⏸ PAUSE
function pause() {
  fetch(`${API}/pause`, {
    method: "POST"
  });
}

// ▶ RESUME
function resume() {
  fetch(`${API}/resume`, {
    method: "POST"
  });
}

// ⏭ SKIP
function skip() {
  fetch(`${API}/skip`, {
    method: "POST"
  });
}

// 🔊 VOLUME
function setVolume(v) {
  fetch(`${API}/volume`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ volume: v })
  });
}

// 📃 LIVE QUEUE + NOW PLAYING
setInterval(() => {
  fetch(`${API}/queue`)
    .then(res => res.json())
    .then(data => {

      // Now Playing
      document.getElementById("now").innerText =
        data.current ? data.current : "Nothing playing";

      // Queue
      const q = document.getElementById("queue");
      q.innerHTML = "";

      data.queue.forEach((song, index) => {
        const li = document.createElement("li");
        li.innerText = `${index + 1}. ${song}`;
        q.appendChild(li);
      });

    })
    .catch(err => {
      console.log("API error:", err);
    });
}, 2000);

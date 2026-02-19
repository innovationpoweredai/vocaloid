// 🔥 CHANGE THIS TO YOUR CLOUDFLARE URL
const API = "https://drew-kiss-steering-thoroughly.trycloudflare.com";

// ================= PLAY =================
function play() {
    const query = document.getElementById("song").value;

    if (!query) {
        alert("Enter link first");
        return;
    }

    fetch(`${API}/play`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: query })
    })
    .then(res => res.json())
    .then(data => {
        console.log("PLAY:", data);
        loadQueue();
    })
    .catch(err => console.error(err));
}

// ================= CONTROLS =================
function pause() {
    fetch(`${API}/pause`, { method: "POST" });
}

function resume() {
    fetch(`${API}/resume`, { method: "POST" });
}

function skip() {
    fetch(`${API}/skip`, { method: "POST" });
}

// ================= QUEUE =================
function loadQueue() {
    fetch(`${API}/queue`)
    .then(res => res.json())
    .then(data => {
        document.getElementById("now").innerText =
            "Now Playing: " + (data.current || "Nothing");

        const q = document.getElementById("queue");
        q.innerHTML = "";

        data.queue.forEach(song => {
            const li = document.createElement("li");
            li.innerText = song;
            q.appendChild(li);
        });
    });
}

// 🔁 AUTO REFRESH
setInterval(loadQueue, 3000);

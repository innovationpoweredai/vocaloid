const API = "https://drew-kiss-steering-thoroughly.trycloudflare.com"; // 🔥 replace this

// ============================
// 🎵 PLAY FUNCTION
// ============================
async function playMusic() {
    const input = document.getElementById("music-input").value.trim();

    if (!input) {
        alert("Enter a link or search!");
        return;
    }

    try {
        await fetch(`${API}/play`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: input
            })
        });

        document.getElementById("music-input").value = "";

    } catch (err) {
        console.log("Play error:", err);
    }
}

// ============================
// ⏯ CONTROLS
// ============================
async function pauseMusic() {
    await fetch(`${API}/pause`, { method: "POST" });
}

async function resumeMusic() {
    await fetch(`${API}/resume`, { method: "POST" });
}

async function skipMusic() {
    await fetch(`${API}/skip`, { method: "POST" });
}

// ============================
// 📜 QUEUE DISPLAY (FIXED)
// ============================
async function loadQueue() {
    try {
        const res = await fetch(`${API}/queue`);
        const data = await res.json();

        const queueBox = document.getElementById("queue");
        queueBox.innerHTML = "";

        // 🎧 Current song
        if (data.current) {
            const current = document.createElement("div");
            current.className = "current-song";
            current.innerText = "🎶 Now: " + data.current;
            queueBox.appendChild(current);
        }

        // 📜 Queue list
        data.queue.forEach((title, index) => {
            const item = document.createElement("div");
            item.className = "queue-item";
            item.innerText = `${index + 1}. ${title}`;
            queueBox.appendChild(item);
        });

    } catch (err) {
        console.log("Queue error:", err);
    }
}

// ============================
// 🔁 AUTO REFRESH QUEUE
// ============================
setInterval(loadQueue, 3000);

// ============================
// 🎯 ENTER KEY SUPPORT
// ============================
document.getElementById("music-input").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        playMusic();
    }
});

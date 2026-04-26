const KEY_OWNER = "ZennqDev";

function changePage(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  if(document.getElementById(id)) document.getElementById(id).classList.add('active');
}

async function updateStatus() {
  try {
    const res = await fetch("/api/status");
    const data = await res.json();
    document.getElementById("status").innerText = data.status;
    document.getElementById("uptime").innerText = data.uptime;
  } catch { document.getElementById("status").innerText = "OFFLINE"; }
}
setInterval(updateStatus, 3000);
updateStatus();

// AUDIO & TIKTOK (Tetap Sama)
const audio = document.getElementById("audio");
function playAudio() { audio.play().catch(() => {}); }
function stopAudio() { audio.pause(); audio.currentTime = 0; }

async function downloadTT() {
  const link = document.getElementById("ttlink").value;
  if (!link) return alert("Link empty!");
  const res = await fetch(`/api/tiktok?url=${encodeURIComponent(link)}`);
  const data = await res.json();
  if (data.data) {
    document.getElementById("previewBox").style.display = "block";
    document.getElementById("videoPreview").src = data.data.play;
    document.getElementById("downloadBtn").href = data.data.play;
  }
}

// SAVE KE SERVER (GLOBAL)
async function saveLink() {
  const url = document.getElementById("up-url").value;
  const fileInput = document.getElementById("up-file");
  const title = document.getElementById("up-title").value;
  const desc = document.getElementById("up-desc").value;

  if(!url || !title) return alert("Link & Title required!");

  let img = "";
  if (fileInput.files[0]) {
    img = await new Promise(r => {
      const reader = new FileReader();
      reader.readAsDataURL(fileInput.files[0]);
      reader.onload = () => r(reader.result);
    });
  }

  const payload = { url, img, title, desc };

  const res = await fetch("/api/links", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    alert("Data Committed Globally!");
    renderList();
    changePage('list');
  }
}

// DELETE DARI SERVER (GLOBAL)
async function deleteLink(index) {
  const key = prompt("Enter Owner Key:");
  if (key === KEY_OWNER) {
    const res = await fetch("/api/links/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index, key })
    });
    if (res.ok) {
      renderList();
      alert("Deleted from Server.");
    }
  } else if (key !== null) { alert("Access Denied!"); }
}

// RENDER LIST DARI SERVER
async function renderList() {
  const container = document.getElementById("archive-container");
  const res = await fetch("/api/links");
  const db = await res.json();
  
  container.innerHTML = db.length ? "" : "<p style='color:gray;'>Archive Empty.</p>";

  [...db].reverse().forEach((item, i) => {
    container.innerHTML += `
      <div class="archive-card">
        <button class="btn-del" onclick="deleteLink(${i})">X</button>
        ${item.img ? `<img src="${item.img}">` : ''}
        <h3 style="color:cyan;">${item.title}</h3>
        <p style="font-size:12px; color:#bbb; margin-bottom:10px;">${item.desc}</p>
        <a href="${item.url}" target="_blank" class="btn" style="display:block; text-align:center; text-decoration:none; color: cyan; border: 1px solid cyan;">DOWNLOAD</a>
      </div>`;
  });
}

renderList();

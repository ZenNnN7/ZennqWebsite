// NAVIGATION
function changePage(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// SERVER STATUS
async function updateStatus() {
  try {
    const res = await fetch("/api/status");
    const data = await res.json();
    document.getElementById("status").innerText = data.status;
    document.getElementById("uptime").innerText = data.uptime;
  } catch {
    document.getElementById("status").innerText = "OFFLINE";
  }
}
setInterval(updateStatus, 1000);
updateStatus();

// AUDIO CONTROL
const audio = document.getElementById("audio");
function playAudio() { audio.play().catch(() => alert("Interaksi layar diperlukan!")); }
function stopAudio() { audio.pause(); audio.currentTime = 0; }

// TIKTOK DOWNLOADER
async function downloadTT() {
  const link = document.getElementById("ttlink").value;
  if (!link) return alert("Link kosong!");

  const loader = document.getElementById("loader");
  loader.style.display = "block";

  try {
    const res = await fetch(`/api/tiktok?url=${encodeURIComponent(link)}`);
    const data = await res.json();
    if (data.data && data.data.play) {
      document.getElementById("previewBox").style.display = "block";
      document.getElementById("videoPreview").src = data.data.play;
      document.getElementById("downloadBtn").href = data.data.play;
    } else {
      alert("Gagal ambil TikTok");
    }
  } catch {
    alert("Error sistem");
  }
  loader.style.display = "none";
}

// ARCHIVE SYSTEM (LOCAL STORAGE)
function saveLink() {
  const url = document.getElementById("up-url").value;
  const img = document.getElementById("up-img").value;
  const title = document.getElementById("up-title").value;
  const desc = document.getElementById("up-desc").value;

  if(!url || !title) return alert("Link dan Judul wajib diisi!");

  const db = JSON.parse(localStorage.getItem("zenn_data") || "[]");
  db.push({ url, img, title, desc });
  localStorage.setItem("zenn_data", JSON.stringify(db));

  alert("Data Berhasil Diupload!");
  
  // Reset input
  document.getElementById("up-url").value = "";
  document.getElementById("up-img").value = "";
  document.getElementById("up-title").value = "";
  document.getElementById("up-desc").value = "";

  renderList();
  changePage('list');
}

function renderList() {
  const container = document.getElementById("archive-container");
  const db = JSON.parse(localStorage.getItem("zenn_data") || "[]");
  container.innerHTML = "";

  if(db.length === 0) {
    container.innerHTML = "<p style='color:gray; margin-top:20px;'>Belum ada link tersimpan.</p>";
    return;
  }

  db.reverse().forEach((item) => {
    container.innerHTML += `
      <div class="archive-card">
        ${item.img ? `<img src="${item.img}">` : ''}
        <h3>${item.title}</h3>
        <p style="font-size:12px; color:#bbb; margin-bottom:10px;">${item.desc || 'Tanpa deskripsi'}</p>
        <a href="${item.url}" target="_blank" class="btn" style="display:block; text-align:center; text-decoration:none; background: rgba(0,255,255,0.1); color: cyan; border: 1px solid cyan;">KUNJUNGI</a>
      </div>
    `;
  });
}

// INIT LOAD
renderList();

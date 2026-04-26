const KEY_OWNER = "ZennqDev";

function changePage(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// STATUS
setInterval(async () => {
  try {
    const res = await fetch("/api/status");
    const data = await res.json();
    document.getElementById("status").innerText = data.status;
    document.getElementById("uptime").innerText = data.uptime;
  } catch { document.getElementById("status").innerText = "OFFLINE"; }
}, 1000);

// AUDIO
const audio = document.getElementById("audio");
function playAudio() { audio.play(); }
function stopAudio() { audio.pause(); audio.currentTime = 0; }

// DOWNLOAD TIKTOK
async function downloadTT() {
  const link = document.getElementById("ttlink").value;
  if (!link) return alert("Isi link dulu!");
  const res = await fetch(`/api/tiktok?url=${encodeURIComponent(link)}`);
  const data = await res.json();
  if (data.data) {
    document.getElementById("previewBox").style.display = "block";
    document.getElementById("videoPreview").src = data.data.play;
    document.getElementById("downloadBtn").href = data.data.play;
  }
}

// SIMPAN LINK & GAMBAR
async function saveLink() {
  const url = document.getElementById("up-url").value;
  const fileInput = document.getElementById("up-file");
  const title = document.getElementById("up-title").value;
  const desc = document.getElementById("up-desc").value;

  if(!url || !title) return alert("Link/Judul wajib!");

  let img = "";
  if (fileInput.files[0]) {
    img = await new Promise(r => {
      const reader = new FileReader();
      reader.readAsDataURL(fileInput.files[0]);
      reader.onload = () => r(reader.result);
    });
  }

  const db = JSON.parse(localStorage.getItem("zenn_data") || "[]");
  db.push({ url, img, title, desc });
  localStorage.setItem("zenn_data", JSON.stringify(db));
  
  alert("Tersimpan!");
  renderList();
  changePage('list');
}

// HAPUS DENGAN KEY OWNER
function deleteLink(index) {
  const key = prompt("Masukkan Key Owner untuk menghapus:");
  if (key === KEY_OWNER) {
    let db = JSON.parse(localStorage.getItem("zenn_data") || "[]");
    db.splice(db.length - 1 - index, 1);
    localStorage.setItem("zenn_data", JSON.stringify(db));
    renderList();
    alert("Data dihapus, ZennqDev.");
  } else {
    alert("Key Salah! Akses ditolak.");
  }
}

function renderList() {
  const container = document.getElementById("archive-container");
  const db = JSON.parse(localStorage.getItem("zenn_data") || "[]");
  container.innerHTML = db.length ? "" : "<p>Kosong</p>";

  [...db].reverse().forEach((item, i) => {
    container.innerHTML += `
      <div class="archive-card">
        <button class="btn-del" onclick="deleteLink(${i})">X</button>
        ${item.img ? `<img src="${item.img}">` : ''}
        <h3 style="color:cyan;">${item.title}</h3>
        <p style="font-size:12px;">${item.desc}</p>
        <a href="${item.url}" target="_blank" class="btn" style="display:block; text-align:center; color:cyan; border:1px solid cyan;">BUKA</a>
      </div>`;
  });
}

renderList();

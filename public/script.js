// CONFIGURATION
const KEY_OWNER = "ZennqDev";

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
function playAudio() { audio.play().catch(() => alert("Klik layar dulu!")); }
function stopAudio() { audio.pause(); audio.currentTime = 0; }

// TIKTOK DOWNLOADER
async function downloadTT() {
  const link = document.getElementById("ttlink").value;
  if (!link) return alert("Link kosong!");

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
}

// ARCHIVE SYSTEM (LOCAL FILE)
async function saveLink() {
  const url = document.getElementById("up-url").value;
  const fileInput = document.getElementById("up-file");
  const title = document.getElementById("up-title").value;
  const desc = document.getElementById("up-desc").value;

  if(!url || !title) return alert("Link dan Judul wajib!");

  let imageData = "";
  if (fileInput.files && fileInput.files[0]) {
    imageData = await convertFileToBase64(fileInput.files[0]);
  }

  const db = JSON.parse(localStorage.getItem("zenn_data") || "[]");
  db.push({ url, img: imageData, title, desc });
  localStorage.setItem("zenn_data", JSON.stringify(db));

  alert("Data Berhasil Disimpan!");
  
  // Reset fields
  document.getElementById("up-url").value = "";
  document.getElementById("up-file").value = "";
  document.getElementById("up-title").value = "";
  document.getElementById("up-desc").value = "";

  renderList();
  changePage('list');
}

function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// FUNGSI HAPUS DENGAN KEY OWNER
function deleteLink(index) {
  const key = prompt("Masukkan Key Owner untuk menghapus:");
  if (key === KEY_OWNER) {
    let db = JSON.parse(localStorage.getItem("zenn_data") || "[]");
    // Karena kita pakai reverse() di tampilan, index di array asli harus dihitung terbalik
    db.splice(db.length - 1 - index, 1);
    localStorage.setItem("zenn_data", JSON.stringify(db));
    renderList();
    alert("Data berhasil dihapus, ZennqDev.");
  } else if (key !== null) {
    alert("Key Salah! Akses ditolak.");
  }
}

function renderList() {
  const container = document.getElementById("archive-container");
  const db = JSON.parse(localStorage.getItem("zenn_data") || "[]");
  container.innerHTML = "";

  if(db.length === 0) {
    container.innerHTML = "<p style='color:gray; margin-top:20px;'>Archive Kosong.</p>";
    return;
  }

  // Tampilkan data terbaru di paling atas
  [...db].reverse().forEach((item, index) => {
    container.innerHTML += `
      <div class="archive-card">
        <button class="btn-del" onclick="deleteLink(${index})">X</button>
        ${item.img ? `<img src="${item.img}">` : ''}
        <h3>${item.title}</h3>
        <p style="font-size:12px; color:#bbb; margin-bottom:10px;">${item.desc || ''}</p>
        <a href="${item.url}" target="_blank" class="btn" style="display:block; text-align:center; text-decoration:none; color: cyan; border: 1px solid cyan;">KUNJUNGI</a>
      </div>
    `;
  });
}

renderList();

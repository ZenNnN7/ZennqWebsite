const KEY_OWNER = "ZennqDev";

function changePage(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if(target) target.classList.add('active');
}

// SERVER STATUS (DIBUNGKUS TRY-CATCH AGAR TIDAK MACET)
async function updateStatus() {
  try {
    const res = await fetch("/api/status");
    if (!res.ok) throw new Error();
    const data = await res.json();
    document.getElementById("status").innerText = data.status || "ONLINE";
    document.getElementById("uptime").innerText = data.uptime || "0";
  } catch (e) {
    document.getElementById("status").innerText = "OFFLINE";
  }
}
setInterval(updateStatus, 3000); // Cek tiap 3 detik saja agar ringan
updateStatus();

const audio = document.getElementById("audio");
function playAudio() { audio.play().catch(() => alert("Interaksi dengan layar dulu!")); }
function stopAudio() { audio.pause(); audio.currentTime = 0; }

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
    } else { alert("Gagal ambil video"); }
  } catch (e) { alert("Error sistem"); }
}

// FUNGSI COMMIT / SIMPAN
async function saveLink() {
  const urlInput = document.getElementById("up-url");
  const fileInput = document.getElementById("up-file");
  const titleInput = document.getElementById("up-title");
  const descInput = document.getElementById("up-desc");

  const url = urlInput.value;
  const title = titleInput.value;
  const desc = descInput.value;

  if(!url || !title) return alert("Link dan Judul tidak boleh kosong!");

  let imageData = "";
  if (fileInput.files && fileInput.files[0]) {
    try {
      imageData = await convertFileToBase64(fileInput.files[0]);
    } catch (e) {
      return alert("Gagal memproses gambar");
    }
  }

  const db = JSON.parse(localStorage.getItem("zenn_data") || "[]");
  db.push({ url, img: imageData, title, desc });
  localStorage.setItem("zenn_data", JSON.stringify(db));

  alert("Data Berhasil di COMMIT!");
  
  // RESET FORM
  urlInput.value = "";
  fileInput.value = "";
  titleInput.value = "";
  descInput.value = "";

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

// HAPUS
function deleteLink(index) {
  const key = prompt("Masukkan Key Owner:");
  if (key === KEY_OWNER) {
    let db = JSON.parse(localStorage.getItem("zenn_data") || "[]");
    db.splice(db.length - 1 - index, 1);
    localStorage.setItem("zenn_data", JSON.stringify(db));
    renderList();
    alert("Terhapus.");
  } else if (key !== null) {
    alert("Key Salah!");
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

// Inisialisasi awal
renderList();

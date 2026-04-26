// --- NAVIGATION ---
function showSection(id) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function openMenu() {
  showSection('menu-panel');
}

// --- SYSTEM STATUS ---
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

// --- TIKTOK ENGINE ---
async function downloadTT() {
  const link = document.getElementById("ttlink").value;
  if (!link) return alert("URL REQUIRED");
  
  const btn = document.querySelector("#dash-panel .btn");
  btn.innerText = "PROCESSING...";

  try {
    const res = await fetch(`/api/tiktok?url=${encodeURIComponent(link)}`);
    const data = await res.json();
    if (data.data && data.data.play) {
      document.getElementById("previewBox").style.display = "block";
      document.getElementById("videoPreview").src = data.data.play;
      document.getElementById("downloadBtn").href = data.data.play;
    } else {
      alert("FAILED TO FETCH DATA");
    }
  } catch {
    alert("SYSTEM ERROR");
  }
  btn.innerText = "EXECUTE";
}

// --- ARCHIVE SYSTEM ---
function saveToArchive() {
  const img = document.getElementById("up-img").value;
  const title = document.getElementById("up-title").value;
  const desc = document.getElementById("up-desc").value;
  const url = document.getElementById("up-url").value;

  if (!title || !url) return alert("TITLE & LINK REQUIRED");

  const storage = JSON.parse(localStorage.getItem("zenn_archive") || "[]");
  storage.push({ img, title, desc, url });
  localStorage.setItem("zenn_archive", JSON.stringify(storage));

  alert("DATA COMMITTED TO ARCHIVE");
  
  // Clear inputs
  document.getElementById("up-img").value = "";
  document.getElementById("up-title").value = "";
  document.getElementById("up-desc").value = "";
  document.getElementById("up-url").value = "";

  renderArchive();
  showSection('archive-panel');
}

function renderArchive() {
  const container = document.getElementById("archive-list");
  const storage = JSON.parse(localStorage.getItem("zenn_archive") || "[]");
  
  if (storage.length === 0) {
    container.innerHTML = "<p style='color:gray;'>NO DATA FOUND</p>";
    return;
  }

  container.innerHTML = "";
  storage.forEach((item) => {
    container.innerHTML += `
      <div class="archive-item">
        ${item.img ? `<img src="${item.img}">` : ''}
        <h3>${item.title}</h3>
        <p>${item.desc}</p>
        <a href="${item.url}" target="_blank" class="btn" style="display:block; text-align:center; padding:5px;">OPEN LINK</a>
      </div>
    `;
  });
}

// Initial Render
renderArchive();

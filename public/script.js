// 🔄 STATUS REALTIME
async function updateStatus() {
  try {
    const res = await fetch("/api/status");
    const data = await res.json();

    document.getElementById("status").innerText = data.status;
    document.getElementById("uptime").innerText = data.uptime;
  } catch {
    document.getElementById("status").innerText = "ERROR";
  }
}

setInterval(updateStatus, 1000);
updateStatus();


// 🔊 AUDIO CONTROL
const audio = document.getElementById("audio");

function playAudio() {
  audio.play().catch(() => {
    alert("Klik lagi untuk play audio");
  });
}

function stopAudio() {
  audio.pause();
  audio.currentTime = 0;
}


// 📥 DOWNLOAD TIKTOK (ASLI KAMU)
async function downloadTT() {
  const link = document.getElementById("ttlink").value;
  const loader = document.getElementById("loader");
  const btn = document.querySelector(".btn");

  if (!link) return alert("Masukkan link dulu");

  btn.disabled = true;
  btn.innerText = "Loading...";

  loader.style.display = "block";
  loader.style.opacity = "0";
  setTimeout(() => loader.style.opacity = "1", 50);

  try {
    const res = await fetch(`/api/tiktok?url=${encodeURIComponent(link)}`);
    const data = await res.json();

    if (data.data && data.data.play) {
      const videoUrl = data.data.play;
      const previewBox = document.getElementById("previewBox");
      const video = document.getElementById("videoPreview");

      previewBox.style.display = "block";
      video.src = videoUrl;
      video.load();

      document.getElementById("downloadBtn").href = videoUrl;
      previewBox.scrollIntoView({ behavior: "smooth" });
    } else {
      alert("Gagal ambil video TikTok");
    }
  } catch {
    alert("Terjadi error pada TikTok");
  }

  setTimeout(() => {
    loader.style.opacity = "0";
    setTimeout(() => { loader.style.display = "none"; }, 300);
  }, 300);

  btn.disabled = false;
  btn.innerText = "TikTok";
}

// 📥 DOWNLOAD YOUTUBE (SESUAI LOGIKA KAMU)
async function downloadYT() {
  const link = document.getElementById("ttlink").value;
  const loader = document.getElementById("loader");
  
  if (!link) return alert("Masukkan link YouTube dulu");

  loader.style.display = "block";

  try {
    const res = await fetch(`/api/youtube?url=${encodeURIComponent(link)}`);
    const data = await res.json();

    if (data.downloadUrl) {
      const previewBox = document.getElementById("previewBox");
      const video = document.getElementById("videoPreview");

      previewBox.style.display = "block";
      video.src = data.downloadUrl;
      video.load();

      document.getElementById("downloadBtn").href = data.downloadUrl;
      previewBox.scrollIntoView({ behavior: "smooth" });
    } else {
      alert(data.error || "Gagal ambil YouTube");
    }
  } catch {
    alert("Terjadi error pada YouTube");
  }

  loader.style.display = "none";
}

// 📥 DOWNLOAD INSTAGRAM (SESUAI LOGIKA KAMU)
async function downloadIG() {
  const link = document.getElementById("ttlink").value;
  const loader = document.getElementById("loader");

  if (!link) return alert("Masukkan link Instagram dulu");

  loader.style.display = "block";

  try {
    const res = await fetch(`/api/ig?url=${encodeURIComponent(link)}`);
    const data = await res.json();

    if (data.url) {
      const previewBox = document.getElementById("previewBox");
      const video = document.getElementById("videoPreview");

      previewBox.style.display = "block";
      video.src = data.url;
      video.load();

      document.getElementById("downloadBtn").href = data.url;
      previewBox.scrollIntoView({ behavior: "smooth" });
    } else {
      alert(data.error || "Gagal ambil Instagram");
    }
  } catch {
    alert("Terjadi error pada Instagram");
  }

  loader.style.display = "none";
}

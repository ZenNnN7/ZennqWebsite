// 🔥 UPDATE STATUS REALTIME
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

// jalan tiap 1 detik
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


// 📥 DOWNLOAD + PREVIEW TIKTOK
async function downloadTT() {
  const link = document.getElementById("ttlink").value;

  if (!link) return alert("Masukkan link TikTok dulu");

  try {
    const res = await fetch(`/api/tiktok?url=${encodeURIComponent(link)}`);
    const data = await res.json();

    if (data.data && data.data.play) {
      const videoUrl = data.data.play;

      // tampilkan preview
      document.getElementById("previewBox").style.display = "block";

      const video = document.getElementById("videoPreview");
      video.src = videoUrl;
      video.load();

      // set tombol download
      const btn = document.getElementById("downloadBtn");
      btn.href = videoUrl;

    } else {
      alert("Gagal ambil video (API error)");
    }

  } catch (err) {
    alert("Terjadi error");
  }
}
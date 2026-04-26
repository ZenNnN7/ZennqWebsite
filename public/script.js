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


// 📥 DOWNLOAD + PREVIEW + SMOOTH UX
async function downloadTT() {
  const link = document.getElementById("ttlink").value;
  const loader = document.getElementById("loader");
  const btn = document.querySelector(".btn"); // tombol download pertama

  if (!link) return alert("Masukkan link dulu");

  // 🔒 disable tombol biar gak spam
  btn.disabled = true;
  btn.innerText = "Loading...";

  // 🔥 tampilkan spinner (fade in)
  loader.style.display = "block";
  loader.style.opacity = "0";
  setTimeout(() => loader.style.opacity = "1", 50);

  try {
    const res = await fetch(`/api/tiktok?url=${encodeURIComponent(link)}`);
    const data = await res.json();

    if (data.data && data.data.play) {
      const videoUrl = data.data.play;

      // tampilkan preview
      const previewBox = document.getElementById("previewBox");
      const video = document.getElementById("videoPreview");

      previewBox.style.display = "block";
      video.src = videoUrl;
      video.load();

      // set tombol download
      document.getElementById("downloadBtn").href = videoUrl;

      // 🚀 auto scroll ke preview (smooth)
      previewBox.scrollIntoView({ behavior: "smooth" });

    } else {
      alert("Gagal ambil video");
    }

  } catch {
    alert("Terjadi error");
  }

  // 🔥 fade out spinner
  setTimeout(() => {
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.style.display = "none";
    }, 300);
  }, 300);

  // 🔓 aktifkan tombol lagi
  btn.disabled = false;
  btn.innerText = "Download TikTok";
}
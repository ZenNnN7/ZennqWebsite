const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8005;

const startTime = Date.now();

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/status", (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  res.json({
    status: "ONLINE",
    uptime: uptime
  });
});

// 📥 API TIKTOK
app.get("/api/tiktok", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.json({ error: "No URL" });
  try {
    const response = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
    res.json(response.data);
  } catch {
    res.json({ error: "Gagal fetch video TikTok" });
  }
});

// 📥 API YOUTUBE (GANTI PROVIDER LEBIH STABIL)
app.get("/api/youtube", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.json({ error: "No URL" });
  try {
    // Pakai itzpire API (biasanya lebih kencang)
    const response = await axios.get(`https://itzpire.com/download/ytdl?url=${encodeURIComponent(url)}`);
    
    if (response.data && response.data.status === "success") {
      res.json({ 
        title: response.data.data.title || "YouTube Video",
        downloadUrl: response.data.data.video // Mengarahkan ke link video langsung
      });
    } else {
      res.json({ error: "Video tidak ditemukan" });
    }
  } catch {
    res.json({ error: "YouTube API sedang error, coba lagi nanti" });
  }
});

// 📥 API INSTAGRAM (GANTI PROVIDER)
app.get("/api/ig", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.json({ error: "No URL" });
  try {
    const response = await axios.get(`https://skizo.tech/api/igdown?url=${encodeURIComponent(url)}`);
    
    if (response.data && response.data[0]) {
      res.json({ url: response.data[0].url });
    } else {
      res.json({ error: "Media Instagram tidak ditemukan" });
    }
  } catch {
    res.json({ error: "Instagram API sedang gangguan" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});

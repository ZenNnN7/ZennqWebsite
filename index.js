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

// API TikTok
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

// API YouTube - Perbaikan Logika Pembacaan Data
app.get("/api/youtube", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.json({ error: "No URL" });
  try {
    const response = await axios.get(`https://api.yanzbotz.my.id/api/downloader/ytdl?url=${encodeURIComponent(url)}`);
    
    // Cek apakah hasil API ada dan punya URL
    if (response.data && response.data.result && response.data.result.url) {
      res.json({ 
        title: response.data.result.title || "YouTube Video",
        downloadUrl: response.data.result.url 
      });
    } else {
      res.json({ error: "Video tidak ditemukan di server API" });
    }
  } catch {
    res.json({ error: "API YouTube sedang gangguan" });
  }
});

// API Instagram - Perbaikan Logika Pembacaan Data
app.get("/api/ig", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.json({ error: "No URL" });
  try {
    const response = await axios.get(`https://api.yanzbotz.my.id/api/downloader/instagram?url=${encodeURIComponent(url)}`);
    
    if (response.data && response.data.result && response.data.result[0]) {
      res.json({ url: response.data.result[0].url });
    } else {
      res.json({ error: "Media Instagram tidak ditemukan" });
    }
  } catch {
    res.json({ error: "API Instagram sedang gangguan" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});

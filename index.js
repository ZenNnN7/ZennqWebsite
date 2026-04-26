const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8005;

const startTime = Date.now();

// Melayani file statis dari folder 'public'
app.use(express.static(path.join(__dirname, "public")));

// Route utama untuk memuat dashboard
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API Status & Uptime
app.get("/api/status", (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  res.json({
    status: "ONLINE",
    uptime: uptime
  });
});

// API TikTok Downloader
app.get("/api/tiktok", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.json({ error: "No URL" });
  try {
    const response = await axios.get(`https://www.tikwm.com/api/?url=${url}`);
    res.json(response.data);
  } catch {
    res.json({ error: "Gagal fetch video TikTok" });
  }
});

// API YouTube Downloader (Menggunakan API Eksternal agar stabil)
app.get("/api/youtube", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.json({ error: "No URL" });
  try {
    const response = await axios.get(`https://api.yanzbotz.my.id/api/downloader/ytdl?url=${url}`);
    const result = response.data.result;
    
    res.json({ 
      title: result.title,
      downloadUrl: result.url 
    });
  } catch {
    res.json({ error: "Gagal ambil YouTube. API mungkin sedang limit." });
  }
});

// API Instagram Downloader
app.get("/api/ig", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.json({ error: "No URL" });
  try {
    const response = await axios.get(`https://api.yanzbotz.my.id/api/downloader/instagram?url=${url}`);
    // Mengambil URL pertama dari hasil pencarian
    res.json({ url: response.data.result[0].url });
  } catch {
    res.json({ error: "Gagal fetch Instagram" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});

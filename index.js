const express = require("express");
const axios = require("axios");
const path = require("path");
const ytdl = require("ytdl-core");

const app = express();
const PORT = process.env.PORT || 8005;

const startTime = Date.now();

// FIX UTAMA: Mengarahkan Express ke folder public secara absolut
app.use(express.static(path.join(__dirname, "public")));

// Menampilkan halaman utama
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

// API TikTok
app.get("/api/tiktok", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.json({ error: "No URL" });
  try {
    const response = await axios.get(`https://www.tikwm.com/api/?url=${url}`);
    res.json(response.data);
  } catch {
    res.json({ error: "Gagal fetch video" });
  }
});

// API YouTube
app.get("/api/youtube", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.json({ error: "No URL" });
  try {
    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: 'audioandvideo' });
    res.json({ downloadUrl: format.url });
  } catch {
    res.json({ error: "Gagal fetch YouTube" });
  }
});

// API Instagram
app.get("/api/ig", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.json({ error: "No URL" });
  try {
    const resIg = await axios.get(`https://api.vreden.web.id/api/igdown?url=${url}`);
    res.json({ url: resIg.data.result[0].url });
  } catch {
    res.json({ error: "Gagal fetch Instagram" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});

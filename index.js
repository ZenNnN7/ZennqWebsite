const express = require("express");
const axios = require("axios");
const path = require("path");
const ytdl = require("ytdl-core");

const app = express();
const PORT = process.env.PORT || 8005;

const startTime = Date.now();

app.use(express.static("public"));

// Tambahan agar Vercel nemu index.html kamu
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// status API
app.get("/api/status", (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  res.json({
    status: "ONLINE",
    uptime: uptime
  });
});

// TikTok downloader (TikWM) - ASLI KAMU
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

// Route YT
app.get("/api/youtube", async (req, res) => {
  try {
    const info = await ytdl.getInfo(req.query.url);
    const format = ytdl.chooseFormat(info.formats, { quality: 'highest' });
    res.json({ downloadUrl: format.url });
  } catch { res.json({ error: "Error YT" }); }
});

// Route IG
app.get("/api/ig", async (req, res) => {
  try {
    const resIg = await axios.get(`https://api.vreden.web.id/api/igdown?url=${req.query.url}`);
    res.json({ url: resIg.data.result[0].url });
  } catch { res.json({ error: "Error IG" }); }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Dashboard jalan di port " + PORT);
});

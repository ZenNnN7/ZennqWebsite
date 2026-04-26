const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 8005;

const startTime = Date.now();

app.use(express.static("public"));

// status API
app.get("/api/status", (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  res.json({
    status: "ONLINE",
    uptime: uptime
  });
});

// TikTok downloader (TikWM)
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

app.listen(PORT, "0.0.0.0", () => {
  console.log("Dashboard jalan di port " + PORT);
});
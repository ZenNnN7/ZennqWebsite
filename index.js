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
  res.json({
    status: "ONLINE",
    uptime: Math.floor((Date.now() - startTime) / 1000)
  });
});

app.get("/api/tiktok", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.json({ error: "No URL" });
  try {
    const response = await axios.get(`https://www.tikwm.com/api/?url=${url}`);
    res.json(response.data);
  } catch (error) {
    res.json({ error: "Gagal fetch video" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("System Active");
});

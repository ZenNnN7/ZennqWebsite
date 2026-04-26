const express = require("express");
const axios = require("axios");
const path = require("path");
const fs = require("fs"); // Tambahkan FS

const app = express();
const PORT = process.env.PORT || 8005;
const startTime = Date.now();
const DB_PATH = path.join(__dirname, "database.json");

app.use(express.json({ limit: '50mb' })); // Agar bisa terima gambar besar
app.use(express.static(path.join(__dirname, "public")));

// Cek jika database.json belum ada
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify([]));
}

app.get("/api/status", (req, res) => {
  res.json({
    status: "ONLINE",
    uptime: Math.floor((Date.now() - startTime) / 1000)
  });
});

// Ambil Data dari Server
app.get("/api/links", (req, res) => {
  const data = JSON.parse(fs.readFileSync(DB_PATH));
  res.json(data);
});

// Simpan Data ke Server
app.post("/api/links", (req, res) => {
  const newData = req.body;
  const data = JSON.parse(fs.readFileSync(DB_PATH));
  data.push(newData);
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  res.json({ success: true });
});

// Hapus Data di Server
app.post("/api/links/delete", (req, res) => {
  const { index, key } = req.body;
  if (key !== "ZennqDev") return res.status(403).json({ error: "Wrong Key" });
  
  let data = JSON.parse(fs.readFileSync(DB_PATH));
  // Karena di frontend di reverse, kita hitung index aslinya
  data.splice(data.length - 1 - index, 1);
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  res.json({ success: true });
});

app.get("/api/tiktok", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.json({ error: "No URL" });
  try {
    const response = await axios.get(`https://www.tikwm.com/api/?url=${url}`);
    res.json(response.data);
  } catch (error) { res.json({ error: "Error" }); }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("System Global Active on Port " + PORT);
});

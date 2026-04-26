const express = require("express");
const { createPool } = require("@vercel/postgres");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8005;
const startTime = Date.now();

// Koneksi Database dengan optimasi biar gak gampang nyangkut
const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
  allowExitOnIdle: true,
  max: 10 // Membatasi koneksi biar gak penuh
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Pastikan tabel siap
async function initDb() {
    try {
        await pool.sql`
            CREATE TABLE IF NOT EXISTS zenn_links (
                id SERIAL PRIMARY KEY,
                data JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        console.log("Database Neon Ready");
    } catch (e) {
        console.error("DB Error:", e.message);
    }
}
initDb();

// --- ROUTES ---

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 1. Ambil List (Dilihat semua orang)
app.get("/api/links", async (req, res) => {
    try {
        // Kita paksa ambil data terbaru tanpa cache
        res.setHeader('Cache-Control', 'no-cache');
        const { rows } = await pool.sql`SELECT id, data FROM zenn_links ORDER BY id DESC;`;
        const results = rows.map(r => ({ ...r.data, db_id: r.id }));
        res.json(results);
    } catch (e) {
        res.json([]);
    }
});

// 2. Simpan Link (Langsung kirim balik list terbaru)
app.post("/api/links", async (req, res) => {
    try {
        const linkData = JSON.stringify(req.body);
        await pool.sql`INSERT INTO zenn_links (data) VALUES (${linkData});`;
        
        // Setelah simpan, kita langsung ambil data terbaru
        const { rows } = await pool.sql`SELECT id, data FROM zenn_links ORDER BY id DESC LIMIT 100;`;
        const updatedList = rows.map(r => ({ ...r.data, db_id: r.id }));
        
        res.json({ success: true, newList: updatedList });
    } catch (e) {
        res.status(500).json({ error: "Gagal simpan" });
    }
});

// 3. Hapus Link (Fix Total)
app.post("/api/links/delete", async (req, res) => {
    const { db_id, key } = req.body;
    if (key !== "ZennqDev") return res.status(403).json({ error: "Akses Ditolak" });
    
    try {
        // Hapus dari database
        const result = await pool.sql`DELETE FROM zenn_links WHERE id = ${db_id};`;
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Data sudah tidak ada di server" });
        }

        // Ambil list terbaru setelah dihapus biar frontend bisa update
        const { rows } = await pool.sql`SELECT id, data FROM zenn_links ORDER BY id DESC;`;
        const updatedList = rows.map(r => ({ ...r.data, db_id: r.id }));

        res.json({ success: true, newList: updatedList });
    } catch (e) {
        res.status(500).json({ error: "Gagal hapus data" });
    }
});

// 4. API TikTok
app.get("/api/tiktok", async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.json({ error: "No URL" });
    try {
        const response = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(videoUrl)}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Gagal fetch video" });
    }
});

// 5. Status
app.get("/api/status", (req, res) => {
    res.json({ status: "ONLINE", uptime: `${Math.floor((Date.now() - startTime) / 1000)}s` });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`System Active on Port ${PORT}`);
});

module.exports = app;

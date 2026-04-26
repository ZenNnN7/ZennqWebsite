const express = require("express");
const { createPool } = require("@vercel/postgres");
const axios = require("axios");
const path = require("path");

const app = express();
const startTime = Date.now();

// Koneksi ke Neon Postgres (Pakai STORAGE_URL sesuai dashboard kamu)
const pool = createPool({
  connectionString: process.env.STORAGE_URL 
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// --- DATABASE SETUP ---
async function initDb() {
    try {
        await pool.sql`
            CREATE TABLE IF NOT EXISTS zenn_links (
                id SERIAL PRIMARY KEY,
                data JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        console.log("Database Ready");
    } catch (e) {
        console.error("DB Error:", e.message);
    }
}
initDb();

// --- API ROUTES ---

// 1. Ambil Semua List Link
app.get("/api/links", async (req, res) => {
    try {
        const { rows } = await pool.sql`SELECT data FROM zenn_links ORDER BY id DESC;`;
        res.json(rows.map(r => r.data));
    } catch (e) {
        res.json([]);
    }
});

// 2. Simpan Link Baru
app.post("/api/links", async (req, res) => {
    try {
        const linkData = JSON.stringify(req.body);
        await pool.sql`INSERT INTO zenn_links (data) VALUES (${linkData});`;
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Gagal simpan ke DB" });
    }
});

// 3. API TikTok (TikWM) - Fitur yang kamu minta
app.get("/api/tiktok", async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).json({ error: "URL required" });
    
    try {
        const response = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(videoUrl)}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "TikTok API Error" });
    }
});

// 4. Hapus Link (Hanya untuk ZennqDev)
app.post("/api/links/delete", async (req, res) => {
    const { index, key } = req.body;
    if (key !== "ZennqDev") return res.status(403).json({ error: "Denied" });
    
    try {
        const { rows } = await pool.sql`SELECT id FROM zenn_links ORDER BY id DESC;`;
        if (rows[index]) {
            const targetId = rows[index].id;
            await pool.sql`DELETE FROM zenn_links WHERE id = ${targetId};`;
        }
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Gagal hapus" });
    }
});

// 5. Status Server
app.get("/api/status", (req, res) => {
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
    res.json({ 
        status: "ONLINE", 
        uptime: `${uptimeSeconds}s`,
        features: ["Database", "TikWM API", "Delete Function"]
    });
});

module.exports = app;

const express = require("express");
const { createPool } = require("@vercel/postgres");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8005;
const startTime = Date.now();

// Koneksi Database Neon Postgres
const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
  allowExitOnIdle: true
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Otomatis buat tabel kalau belum ada
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

// --- API ROUTES ---

// Halaman Utama
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 1. Ambil Semua List Link (Untuk dilihat semua orang)
app.get("/api/links", async (req, res) => {
    try {
        const { rows } = await pool.sql`SELECT id, data FROM zenn_links ORDER BY id DESC;`;
        // Menyisipkan db_id agar frontend bisa hapus data dengan tepat
        const results = rows.map(r => ({ ...r.data, db_id: r.id }));
        res.json(results);
    } catch (e) {
        res.json([]);
    }
});

// 2. Simpan Link Baru ke Database
app.post("/api/links", async (req, res) => {
    try {
        const linkData = JSON.stringify(req.body);
        const result = await pool.sql`INSERT INTO zenn_links (data) VALUES (${linkData}) RETURNING id;`;
        res.json({ success: true, id: result.rows[0].id });
    } catch (e) {
        res.status(500).json({ error: "Gagal simpan ke database" });
    }
});

// 3. Hapus Link (Berdasarkan ID Unik Database)
app.post("/api/links/delete", async (req, res) => {
    const { db_id, key } = req.body;
    if (key !== "ZennqDev") return res.status(403).json({ error: "Akses Ditolak" });
    
    try {
        await pool.sql`DELETE FROM zenn_links WHERE id = ${db_id};`;
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Gagal hapus data" });
    }
});

// 4. API TikTok (Via TikWM)
app.get("/api/tiktok", async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.json({ error: "No URL" });
    try {
        const response = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(videoUrl)}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Gagal fetch video TikTok" });
    }
});

// 5. Status System
app.get("/api/status", (req, res) => {
    res.json({
        status: "ONLINE",
        uptime: `${Math.floor((Date.now() - startTime) / 1000)}s`,
        database: "CONNECTED"
    });
});

// Jalankan Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`System Active on Port ${PORT}`);
});

module.exports = app;
app.get("/api/links", async (req, res) => {
    try {
        const { rows } = await pool.sql`SELECT data FROM zenn_links ORDER BY id DESC;`;
        res.json(rows.map(r => r.data));
    } catch (e) {
        res.json([]);
    }
});

// 2. Simpan Link
app.post("/api/links", async (req, res) => {
    try {
        const linkData = JSON.stringify(req.body);
        await pool.sql`INSERT INTO zenn_links (data) VALUES (${linkData});`;
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Gagal simpan ke DB" });
    }
});

// 3. API TikTok TikWM
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

// 4. Hapus Link
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

// 5. Server Status
app.get("/api/status", (req, res) => {
    res.json({ 
        status: "ONLINE", 
        database: "NEON_POSTGRES",
        uptime: `${Math.floor((Date.now() - startTime) / 1000)}s`
    });
});

module.exports = app;

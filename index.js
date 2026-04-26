const express = require("express");
const { createPool } = require("@vercel/postgres");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8005;
const startTime = Date.now();

// Koneksi Database - Pastikan Environment Variable POSTGRES_URL sudah ada di Vercel
const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
});

// Middleware biar bisa upload gambar (limit 50mb)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Cek & Buat Tabel di Awal
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
        console.error("DB Init Error:", e.message);
    }
}
initDb();

// 1. Ambil List Link (Dikasih proteksi biar gak Error 500)
app.get("/api/links", async (req, res) => {
    try {
        const result = await pool.sql`SELECT data FROM zenn_links ORDER BY id DESC;`;
        const rows = result.rows || []; // Proteksi jika rows undefined
        res.json(rows.map(r => r.data));
    } catch (e) {
        console.error("Fetch Error:", e.message);
        res.status(200).json([]); // Balikin array kosong aja biar frontend gak crash
    }
});

// 2. Simpan Link
app.post("/api/links", async (req, res) => {
    try {
        const payload = req.body;
        await pool.sql`INSERT INTO zenn_links (data) VALUES (${JSON.stringify(payload)});`;
        res.json({ success: true });
    } catch (e) {
        console.error("Save Error:", e.message);
        res.status(500).json({ error: "Gagal simpan" });
    }
});

// 3. TikTok TikWM
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

// 4. Hapus Link (FIX: Baris 97 yang bikin error di log lo)
app.post("/api/links/delete", async (req, res) => {
    const { index, key } = req.body;
    if (key !== "ZennqDev") return res.status(403).json({ error: "Denied" });
    
    try {
        const result = await pool.sql`SELECT id FROM zenn_links ORDER BY id DESC;`;
        const rows = result.rows;

        // Pastikan rows ada dan index yang diklik valid
        if (rows && rows[index]) {
            const targetId = rows[index].id;
            await pool.sql`DELETE FROM zenn_links WHERE id = ${targetId};`;
            res.json({ success: true });
        } else {
            res.status(404).json({ error: "Data gak ketemu" });
        }
    } catch (e) {
        console.error("Delete Error:", e.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 5. Server Status
app.get("/api/status", (req, res) => {
    res.json({ 
        status: "ONLINE", 
        uptime: `${Math.floor((Date.now() - startTime) / 1000)}s`
    });
});

app.listen(PORT, () => {
    console.log(`Server jalan di port ${PORT}`);
});

module.exports = app;

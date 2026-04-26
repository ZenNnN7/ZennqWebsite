const express = require("express");
const { createPool } = require("@vercel/postgres");
const axios = require("axios");
const path = require("path");

const app = express();
const startTime = Date.now();

// Menggunakan POSTGRES_URL sesuai yang ada di foto Environment Variables kamu
const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
  allowExitOnIdle: true
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Setup Tabel Otomatis
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
        console.error("Gagal koneksi database:", e.message);
    }
}
initDb();

// 1. Ambil List Link (Penyebab Archive Empty)
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
        const { rows } = await pool.sql`SELECT id, data FROM zenn_links ORDER BY id DESC;`;
        // Menyisipkan ID database ke dalam objek data agar tidak random saat dihapus
        res.json(rows.map(r => ({ ...r.data, db_id: r.id })));
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

// 4. Hapus Link - FIX: Cari ID yang spesifik, bukan urutan (index)
app.post("/api/links/delete", async (req, res) => {
    const { db_id, key } = req.body; // Ganti 'index' jadi 'db_id'
    if (key !== "ZennqDev") return res.status(403).json({ error: "Denied" });
    
    try {
        // Langsung hapus ID yang dituju, jadi nggak bakal salah hapus/random
        await pool.sql`DELETE FROM zenn_links WHERE id = ${db_id};`;
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

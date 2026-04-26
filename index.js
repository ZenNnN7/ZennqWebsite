const express = require("express");
const { createPool } = require("@vercel/postgres");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8005;
const startTime = Date.now();

// Koneksi Database
const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
  allowExitOnIdle: true
});

// Middleware - Pastikan JSON diproses dengan benar
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Setup Tabel
async function initDb() {
    try {
        await pool.sql`
            CREATE TABLE IF NOT EXISTS zenn_links (
                id SERIAL PRIMARY KEY,
                data JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        console.log("✔️ Database Ready");
    } catch (e) {
        console.error("❌ DB Init Error:", e.message);
    }
}
initDb();

// --- API ROUTES ---

// Ambil List
app.get("/api/links", async (req, res) => {
    try {
        const { rows } = await pool.sql`SELECT id, data FROM zenn_links ORDER BY id DESC;`;
        const results = rows.map(r => ({ ...r.data, db_id: r.id }));
        res.json(results);
    } catch (e) {
        console.error("❌ Fetch Error:", e.message);
        res.json([]);
    }
});

// Simpan Link
app.post("/api/links", async (req, res) => {
    console.log("📥 Incoming Upload:", req.body);
    try {
        const linkData = JSON.stringify(req.body);
        await pool.sql`INSERT INTO zenn_links (data) VALUES (${linkData});`;
        console.log("✅ Berhasil Simpan");
        res.json({ success: true });
    } catch (e) {
        console.error("❌ Save Error:", e.message);
        res.status(500).json({ error: e.message });
    }
});

// Hapus Link (Gue tambahin Log Detail di sini)
app.post("/api/links/delete", async (req, res) => {
    console.log("🗑️ Request Hapus Masuk:", req.body);
    const { db_id, key } = req.body;

    if (key !== "ZennqDev") {
        console.log("🚫 Hapus Ditolak: Key Salah");
        return res.status(403).json({ error: "Key Salah" });
    }

    if (!db_id) {
        console.log("⚠️ Hapus Gagal: db_id Kosong");
        return res.status(400).json({ error: "db_id diperlukan" });
    }

    try {
        const result = await pool.sql`DELETE FROM zenn_links WHERE id = ${db_id};`;
        console.log(`♻️ Hasil Hapus: ${result.rowCount} baris terhapus`);
        
        // Ambil data terbaru buat update tampilan otomatis
        const { rows } = await pool.sql`SELECT id, data FROM zenn_links ORDER BY id DESC;`;
        const updatedList = rows.map(r => ({ ...r.data, db_id: r.id }));
        
        res.json({ success: true, newList: updatedList });
    } catch (e) {
        console.error("❌ Delete Error:", e.message);
        res.status(500).json({ error: e.message });
    }
});

// TikTok API
app.get("/api/tiktok", async (req, res) => {
    try {
        const response = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(req.query.url)}`);
        res.json(response.data);
    } catch (e) {
        res.status(500).json({ error: "TikTok Error" });
    }
});

// Status
app.get("/api/status", (req, res) => {
    res.json({ status: "ONLINE", uptime: `${Math.floor((Date.now() - startTime) / 1000)}s` });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server jalan di port ${PORT}`);
});

module.exports = app;

const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();

// Tingkatkan limit agar bisa upload gambar dari galeri tanpa error 413
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Konfigurasi Database Upstash (Ambil dari Environment Vercel)
// Masukkan UPSTASH_REDIS_REST_URL di Settings Vercel kamu
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "GQAAAAAAAQiuAAIgcDE1MzllMTg2YTE1YWE0MjliYjI1MGZjZDkxZjU1ODA5MQ";

/**
 * Fungsi bantu untuk berkomunikasi dengan Upstash Redis
 * Menggunakan Axios agar lebih stabil di lingkungan Vercel
 */
async function redisAction(method, key, value = null) {
    const config = { 
        headers: { 
            Authorization: `Bearer ${UPSTASH_TOKEN}`,
            "Content-Type": "application/json"
        } 
    };

    try {
        if (method === 'get') {
            const res = await axios.get(`${UPSTASH_URL}/get/${key}`, config);
            return res.data.result;
        } else {
            // Menggunakan POST /set untuk menyimpan data JSON (termasuk Base64 gambar)
            const res = await axios.post(`${UPSTASH_URL}/set/${key}`, JSON.stringify(value), config);
            return res.data.result;
        }
    } catch (e) {
        console.error("Database Error:", e.response ? e.response.data : e.message);
        return null;
    }
}

// API: Status System
app.get("/api/status", (req, res) => {
    res.json({ 
        status: "ONLINE", 
        uptime: "Global Active",
        provider: "Vercel + Upstash"
    });
});

// API: Ambil semua data (List Link Global)
app.get("/api/links", async (req, res) => {
    try {
        const raw = await redisAction('get', 'zenn_data');
        // Jika database kosong, kembalikan array kosong []
        res.json(raw ? JSON.parse(raw) : []);
    } catch (e) {
        res.json([]);
    }
});

// API: Simpan data baru ke Database Global
app.post("/api/links", async (req, res) => {
    try {
        const raw = await redisAction('get', 'zenn_data');
        let data = raw ? JSON.parse(raw) : [];
        
        // Tambahkan data baru dari form upload ke array
        data.push(req.body);
        
        // Simpan kembali array yang sudah diperbarui ke Upstash
        await redisAction('set', 'zenn_data', data);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Gagal menyimpan ke database global" });
    }
});

// API: Hapus data (Hanya untuk Owner ZennqDev)
app.post("/api/links/delete", async (req, res) => {
    const { index, key } = req.body;
    
    // Keamanan: Cek Key Owner
    if (key !== "ZennqDev") {
        return res.status(403).json({ error: "Access Denied: Wrong Key" });
    }

    try {
        const raw = await redisAction('get', 'zenn_data');
        let data = JSON.parse(raw);
        
        // Hapus item berdasarkan index (disesuaikan dengan tampilan reverse di frontend)
        data.splice(data.length - 1 - index, 1);
        
        await redisAction('set', 'zenn_data', data);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Gagal menghapus data dari server" });
    }
});

// API: TikTok Downloader Proxy
app.get("/api/tiktok", async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).json({ error: "URL is required" });

    try {
        const response = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(videoUrl)}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "TikTok Service Error" });
    }
});

// Export untuk Vercel Serverless Function
module.exports = app;

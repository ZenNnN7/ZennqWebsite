const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const startTime = Date.now();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Cek semua kemungkinan nama variabel yang kamu buat di Vercel
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.URL_REST_REDIS_UPSTASH || process.env.URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.TOKEN;

async function redisAction(command, key, value = null) {
    if (!UPSTASH_URL || !UPSTASH_TOKEN) {
        console.error("Variabel Vercel belum terbaca!");
        return null;
    }
    
    // Pastikan URL tidak diakhiri tanda miring /
    const cleanUrl = UPSTASH_URL.replace(/\/$/, "");
    const url = `${cleanUrl}/${command}/${key}`;
    
    const config = { 
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN.trim()}` } 
    };

    try {
        if (command === 'get') {
            const res = await axios.get(url, config);
            return res.data.result;
        } else {
            const res = await axios.post(url, JSON.stringify(value), config);
            return res.data.result;
        }
    } catch (e) {
        return null;
    }
}

app.get("/api/status", (req, res) => {
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
    res.json({ status: "ONLINE", uptime: `${uptimeSeconds}s` });
});

app.get("/api/links", async (req, res) => {
    try {
        // Kita coba ambil dari key 'ZennqDb' sesuai gambar Upstash kamu
        const raw = await redisAction('get', 'ZennqDb');
        if (!raw || raw === "value" || raw === "nilai") return res.json([]);
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        res.json(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
        res.json([]);
    }
});

app.post("/api/links", async (req, res) => {
    try {
        const raw = await redisAction('get', 'ZennqDb');
        let data = [];
        if (raw && raw !== "value" && raw !== "nilai") {
            data = typeof raw === 'string' ? JSON.parse(raw) : raw;
        }
        if (!Array.isArray(data)) data = [];
        
        data.push(req.body);
        await redisAction('set', 'ZennqDb', data);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Gagal simpan" });
    }
});

app.post("/api/links/delete", async (req, res) => {
    const { index, key } = req.body;
    if (key !== "ZennqDev") return res.status(403).json({ error: "Denied" });
    try {
        const raw = await redisAction('get', 'ZennqDb');
        let data = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (Array.isArray(data)) {
            data.splice(data.length - 1 - index, 1);
            await redisAction('set', 'ZennqDb', data);
        }
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Error" });
    }
});

module.exports = app;

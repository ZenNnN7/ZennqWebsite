const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const startTime = Date.now();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// Fungsi Akses Database (Key disesuaikan dengan gambar kamu: ZennqDb)
async function redisAction(command, key, value = null) {
    const url = `${UPSTASH_URL}/${command}/${key}`;
    const config = { 
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` } 
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

// Status & Runtime (Fix Detik)
app.get("/api/status", (req, res) => {
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
    res.json({ 
        status: "ONLINE", 
        uptime: `${uptimeSeconds}s` 
    });
});

// Ambil List
app.get("/api/links", async (req, res) => {
    try {
        const raw = await redisAction('get', 'ZennqDb');
        if (!raw || raw === "value") return res.json([]); 
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        res.json(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
        res.json([]);
    }
});

// Simpan Data
app.post("/api/links", async (req, res) => {
    try {
        const raw = await redisAction('get', 'ZennqDb');
        let data = [];
        if (raw && raw !== "value") {
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

// Hapus Link
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

// TikTok API
app.get("/api/tiktok", async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).json({ error: "No URL" });
    try {
        const response = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(videoUrl)}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Error" });
    }
});

module.exports = app;

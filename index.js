const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();

// Catat waktu mulai server untuk hitung Runtime
const startTime = Date.now();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

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
            const res = await axios.post(`${UPSTASH_URL}/set/${key}`, JSON.stringify(value), config);
            return res.data.result;
        }
    } catch (e) {
        return null;
    }
}

// FIX: Runtime kembali menghitung detik
app.get("/api/status", (req, res) => {
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
    res.json({ 
        status: "ONLINE", 
        uptime: `${uptimeSeconds}s` 
    });
});

app.get("/api/links", async (req, res) => {
    try {
        const raw = await redisAction('get', 'zenn_data');
        res.json(raw ? JSON.parse(raw) : []);
    } catch (e) {
        res.json([]);
    }
});

app.post("/api/links", async (req, res) => {
    try {
        const raw = await redisAction('get', 'zenn_data');
        let data = raw ? JSON.parse(raw) : [];
        data.push(req.body);
        await redisAction('set', 'zenn_data', data);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Error" });
    }
});

app.post("/api/links/delete", async (req, res) => {
    const { index, key } = req.body;
    if (key !== "ZennqDev") return res.status(403).json({ error: "Denied" });
    try {
        const raw = await redisAction('get', 'zenn_data');
        let data = JSON.parse(raw);
        data.splice(data.length - 1 - index, 1);
        await redisAction('set', 'zenn_data', data);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Error" });
    }
});

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

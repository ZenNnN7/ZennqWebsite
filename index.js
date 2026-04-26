const express = require("express");
const axios = require("axios");
const path = require("path");
const fs = require("fs");

const app = express();
const startTime = Date.now();
const DB_PATH = path.join(__dirname, "database.json");

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Fungsi baca data dari file
const readDb = () => {
    try {
        const data = fs.readFileSync(DB_PATH, "utf8");
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
};

// Fungsi tulis data ke file
const writeDb = (data) => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
        return true;
    } catch (e) {
        return false;
    }
};

// Runtime normal (detik)
app.get("/api/status", (req, res) => {
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
    res.json({ 
        status: "ONLINE", 
        uptime: `${uptimeSeconds}s` 
    });
});

// Ambil List dari file JSON
app.get("/api/links", (req, res) => {
    res.json(readDb());
});

// Tambah Link ke file JSON
app.post("/api/links", (req, res) => {
    try {
        const db = readDb();
        db.push(req.body);
        writeDb(db);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Gagal simpan" });
    }
});

// Hapus Link dari file JSON
app.post("/api/links/delete", (req, res) => {
    const { index, key } = req.body;
    if (key !== "ZennqDev") return res.status(403).json({ error: "Denied" });
    
    try {
        const db = readDb();
        db.splice(db.length - 1 - index, 1);
        writeDb(db);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Gagal hapus" });
    }
});

module.exports = app;

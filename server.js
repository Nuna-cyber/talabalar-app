
const express = require("express");
const { Pool } = require("pg");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const url = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: url,
    ssl: url && url.includes("render.com")
        ? { rejectUnauthorized: false }
        : false
});

// Frontend fayllarini ulash
app.use(express.static(path.join(__dirname, "public")));

// Talabalar jadvalini yaratish
async function initDatabase() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS talabalar (
            id SERIAL PRIMARY KEY,
            ism VARCHAR(100) NOT NULL,
            guruh VARCHAR(50) NOT NULL
        )
    `);
}

// Barcha talabalarni olish
app.get("/api/talabalar", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM talabalar ORDER BY id ASC"
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ma'lumotlarni olishda xatolik" });
    }
});

// Yangi talaba qo‘shish
app.post("/api/talabalar", async (req, res) => {
    try {
        const { ism, guruh } = req.body;

        if (!ism || !guruh) {
            return res.status(400).json({
                error: "Ism va guruhni kiriting"
            });
        }

        const result = await pool.query(
            "INSERT INTO talabalar (ism, guruh) VALUES ($1, $2) RETURNING *",
            [ism.trim(), guruh.trim()]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Talabani qo‘shishda xatolik" });
    }
});

// Serverni ishga tushirish
const PORT = process.env.PORT || 3000;

initDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server ${PORT}-portda ishlayapti, jadval tayyor`);
        });
    })
    .catch((error) => {
        console.error("Database xatosi:", error);
        process.exit(1);
    });

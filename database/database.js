const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

// Use a file-based database
const dbPath = path.resolve(__dirname, 'vintage_vines.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error connecting to database:", err.message);
    } else {
        console.log("Connected to the vintage_vines SQLite database.");
        initDb(); // Initialize tables and data
    }
});

function initDb() {
    db.serialize(() => {
        // --- Create Tables ---
        console.log("Creating tables...");

        // Users Table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('Admin', 'Staff'))
            )
        `);

        // Wines Table (Stock)
        db.run(`
            CREATE TABLE IF NOT EXISTS wines (
                wine_id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                price REAL NOT NULL,
                stock INTEGER NOT NULL
            )
        `);

        // Sales Table
        db.run(`
            CREATE TABLE IF NOT EXISTS sales (
                sale_id INTEGER PRIMARY KEY AUTOINCREMENT,
                wine_id INTEGER,
                quantity INTEGER NOT NULL,
                total_price REAL NOT NULL,
                sale_date TEXT NOT NULL,
                FOREIGN KEY (wine_id) REFERENCES wines(wine_id) ON DELETE SET NULL
            )
        `);

        // --- Insert Mock Data (if tables are new) ---
        // We use bcrypt.hashSync for mock data insertion to avoid async issues in init
        const saltRounds = 10;
        const adminPass = 'admin123';
        const staffPass = 'staff123';
        const adminHash = bcrypt.hashSync(adminPass, saltRounds);
        const staffHash = bcrypt.hashSync(staffPass, saltRounds);

        // Add Mock Users (IGNORE constraint errors if they already exist)
        db.run(`INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)`, ['admin_jane', adminHash, 'Admin']);
        db.run(`INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)`, ['staff_bob', staffHash, 'Staff']);
        
        // Add Mock Wines (IGNORE constraint errors if they already exist)
        db.run(`INSERT OR IGNORE INTO wines (name, type, price, stock) VALUES (?, ?, ?, ?)`, ['Cabernet Sauvignon 2020', 'Red', 25.00, 150]);
        db.run(`INSERT OR IGNORE INTO wines (name, type, price, stock) VALUES (?, ?, ?, ?)`, ['Chardonnay 2022', 'White', 22.50, 120]);
        db.run(`INSERT OR IGNORE INTO wines (name, type, price, stock) VALUES (?, ?, ?, ?)`, ['Pinot Noir 2021', 'Red', 30.00, 80]);

        // Add Mock Sale
        db.run(`INSERT OR IGNORE INTO sales (wine_id, quantity, total_price, sale_date) VALUES (?, ?, ?, ?)`, [1, 2, 50.00, '2025-11-15']);
        
        console.log("Database initialized.");
    });
}

module.exports = db;
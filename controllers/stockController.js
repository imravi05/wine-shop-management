const db = require('../database/database.js');

// GET /api/wines
exports.getAllWines = (req, res) => {
    const sql = "SELECT * FROM wines ORDER BY name";
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ data: rows });
    });
};

// GET /api/wines/:id (Example: for fetching one)
exports.getWineById = (req, res) => {
    const sql = "SELECT * FROM wines WHERE wine_id = ?";
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: "Wine not found" });
        }
        res.json({ data: row });
    });
};

// POST /api/wines
exports.createWine = (req, res) => {
    const { name, type, price, stock } = req.body;
    if (!name || !type || !price || stock == null) {
        return res.status(400).json({ error: "Please provide all fields." });
    }

    const sql = `INSERT INTO wines (name, type, price, stock) VALUES (?, ?, ?, ?)`;
    db.run(sql, [name, type, price, stock], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ 
            message: "Wine added successfully",
            data: { wine_id: this.lastID, name, type, price, stock }
        });
    });
};

// PUT /api/wines/:id
exports.updateWine = (req, res) => {
    const { name, type, price, stock } = req.body;
    const id = req.params.id;
    
    if (!name || !type || !price || stock == null) {
        return res.status(400).json({ error: "Please provide all fields." });
    }

    const sql = `UPDATE wines SET name = ?, type = ?, price = ?, stock = ? WHERE wine_id = ?`;
    db.run(sql, [name, type, price, stock, id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Wine not found" });
        }
        res.json({ 
            message: "Wine updated successfully",
            changes: this.changes 
        });
    });
};

// DELETE /api/wines/:id
exports.deleteWine = (req, res) => {
    const id = req.params.id;
    // In a real app, you might check for sales first.
    // For now, the ON DELETE SET NULL constraint in the DB will handle it.
    
    const sql = `DELETE FROM wines WHERE wine_id = ?`;
    db.run(sql, [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Wine not found" });
        }
        res.json({ 
            message: "Wine deleted successfully",
            changes: this.changes 
        });
    });
};
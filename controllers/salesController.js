const db = require('../database/database.js');

// GET /api/sales
exports.getAllSales = (req, res) => {
    // This query matches the one noted in your frontend
    const sql = `
        SELECT s.sale_id, w.name, s.quantity, s.total_price, s.sale_date
        FROM sales s
        LEFT JOIN wines w ON s.wine_id = w.wine_id
        ORDER BY s.sale_date DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ data: rows });
    });
};

// POST /api/sales
exports.createSale = (req, res) => {
    const { wine_id, quantity } = req.body;
    
    if (!wine_id || !quantity || quantity <= 0) {
        return res.status(400).json({ error: "Invalid wine ID or quantity." });
    }

    // Securely get price from DB and check stock
    const checkSql = "SELECT price, stock FROM wines WHERE wine_id = ?";
    
    db.get(checkSql, [wine_id], (err, wine) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!wine) {
            return res.status(404).json({ error: "Wine not found." });
        }
        if (wine.stock < quantity) {
            return res.status(400).json({ error: "Not enough stock." });
        }

        const totalPrice = wine.price * quantity;
        const saleDate = new Date().toISOString();
        const newStock = wine.stock - quantity;

        // Use a transaction to ensure both operations succeed or fail together
        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            const insertSaleSql = `INSERT INTO sales (wine_id, quantity, total_price, sale_date) VALUES (?, ?, ?, ?)`;
            const updateStockSql = `UPDATE wines SET stock = ? WHERE wine_id = ?`;

            db.run(insertSaleSql, [wine_id, quantity, totalPrice, saleDate], function(err) {
                if (err) {
                    db.run("ROLLBACK");
                    return res.status(500).json({ error: err.message });
                }
                
                const saleId = this.lastID; // Get the ID of the new sale

                db.run(updateStockSql, [newStock, wine_id], function(err) {
                    if (err) {
                        db.run("ROLLBACK");
                        return res.status(500).json({ error: err.message });
                    }

                    db.run("COMMIT", (err) => {
                        if (err) {
                             return res.status(500).json({ error: err.message });
                        }
                        res.status(201).json({
                            message: "Sale recorded successfully",
                            data: { sale_id: saleId, wine_id, quantity, total_price: totalPrice, sale_date: saleDate }
                        });
                    });
                });
            });
        });
    });
};

// DELETE /api/sales/:id
exports.deleteSale = (req, res) => {
    const id = req.params.id;

    // We should restore stock when a sale is deleted.
    const getSaleSql = "SELECT wine_id, quantity FROM sales WHERE sale_id = ?";
    
    db.get(getSaleSql, [id], (err, sale) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!sale) {
            return res.status(404).json({ error: "Sale not found." });
        }

        db.serialize(() => {
            db.run("BEGIN TRANSACTION");
            
            const deleteSql = `DELETE FROM sales WHERE sale_id = ?`;
            const updateStockSql = `UPDATE wines SET stock = stock + ? WHERE wine_id = ?`;
            
            db.run(deleteSql, [id], function(err) {
                if (err) {
                    db.run("ROLLBACK");
                    return res.status(500).json({ error: err.message });
                }

                // Only restore stock if the wine_id existed
                if (sale.wine_id) {
                    db.run(updateStockSql, [sale.quantity, sale.wine_id], function(err) {
                        if (err) {
                            db.run("ROLLBACK");
                            return res.status(500).json({ error: err.message });
                        }
                        db.run("COMMIT");
                        res.json({ message: "Sale deleted and stock restored" });
                    });
                } else {
                    db.run("COMMIT");
                    res.json({ message: "Sale deleted (wine was already removed)" });
                }
            });
        });
    });
};
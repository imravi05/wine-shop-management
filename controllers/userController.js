const db = require('../database/database.js');
const bcrypt = require('bcrypt');

const saltRounds = 10;

// GET /api/users
exports.getAllUsers = (req, res) => {
    // CRITICAL: Never select the password_hash
    const sql = "SELECT user_id, username, role FROM users";
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ data: rows });
    });
};

// POST /api/users
exports.createUser = async (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
        return res.status(400).json({ error: "Username, password, and role are required." });
    }

    try {
        const hash = await bcrypt.hash(password, saltRounds);
        const sql = `INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)`;
        
        db.run(sql, [username, hash, role], function(err) {
            if (err) {
                // Check for unique constraint error
                if (err.message.includes("UNIQUE constraint failed")) {
                    return res.status(400).json({ error: "Username already exists." });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ 
                message: "User created successfully",
                data: { user_id: this.lastID, username, role }
            });
        });
    } catch (err) {
        res.status(500).json({ error: "Error hashing password." });
    }
};

// PUT /api/users/:id
exports.updateUser = async (req, res) => {
    const { username, role, password } = req.body;
    const id = req.params.id;

    if (!username || !role) {
        return res.status(400).json({ error: "Username and role are required." });
    }

    try {
        // This logic matches your frontend: "Leave blank to keep unchanged"
        if (password) {
            // --- Update with new password ---
            const hash = await bcrypt.hash(password, saltRounds);
            const sql = `UPDATE users SET username = ?, role = ?, password_hash = ? WHERE user_id = ?`;
            
            db.run(sql, [username, role, hash, id], function(err) {
                if (err) {
                     return res.status(500).json({ error: err.message });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ error: "User not found" });
                }
                res.json({ message: "User updated successfully (with new password)." });
            });
        } else {
            // --- Update without changing password ---
            const sql = `UPDATE users SET username = ?, role = ? WHERE user_id = ?`;
            
            db.run(sql, [username, role, id], function(err) {
                if (err) {
                     return res.status(500).json({ error: err.message });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ error: "User not found" });
                }
                res.json({ message: "User updated successfully (password unchanged)." });
            });
        }
    } catch (err) {
        res.status(500).json({ error: "Error processing update." });
    }
};

// DELETE /api/users/:id
exports.deleteUser = (req, res) => {
    const id = req.params.id;
    const sql = `DELETE FROM users WHERE user_id = ?`;
    
    db.run(sql, [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ 
            message: "User deleted successfully",
            changes: this.changes 
        });
    });
};
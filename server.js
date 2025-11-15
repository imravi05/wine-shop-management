const express = require('express');
const cors = require('cors');
const db = require('./database/database.js'); // This import initializes the DB

// --- Import Routes ---
const salesRoutes = require('./routes/salesRoutes');
const stockRoutes = require('./routes/stockRoutes'); // Note: This is for /api/wines
const userRoutes = require('./routes/userRoutes');

// --- Initialize Express App ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
// Enable Cross-Origin Resource Sharing (CORS)
// This is essential for your frontend to talk to this backend
app.use(cors());

// Enable built-in JSON parsing
app.use(express.json());

// --- Mount Routes ---
// When a request comes to /api/sales, use salesRoutes
app.use('/api/sales', salesRoutes);
// When a request comes to /api/wines, use stockRoutes
app.use('/api/wines', stockRoutes);
// When a request comes to /api/users, use userRoutes
app.use('/api/users', userRoutes);

// --- Root Route ---
app.get('/', (req, res) => {
    res.json({ message: "Welcome to the Vintage Vines API. The server is running!" });
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
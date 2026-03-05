const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config(); // Load environment variables

const app = express();
const PORT = 5003;

// Security Middleware
app.use(helmet());

// Apply Rate Limiting to prevent brute-force & DDoS
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: 'Too many requests',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// General Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const dataRoutes = require('./routes/dataRoutes');
app.use('/api/data', dataRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const historyRoutes = require('./routes/historyRoutes');
app.use('/api/history', historyRoutes);

const sessionRoutes = require('./routes/sessionRoutes');
app.use('/api/sessions', sessionRoutes);

// Start server
const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

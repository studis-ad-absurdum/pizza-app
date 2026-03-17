require('dotenv').config();
const express = require('express');
const path = require('path');

const authRoutes = require('./routes/login');
const eventRoutes = require('./routes/events');
const toppingRoutes = require('./routes/toppings');

const app = express();
app.use(express.json());

// static admin panel
app.use('/admin', express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api/login', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/events/:eventId/toppings', toppingRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server läuft auf ${PORT}`));
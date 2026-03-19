require('dotenv').config();
const express = require('express');
const path = require('path');

const authRoutes = require('./routes/login');
const eventRoutes = require('./routes/events');
const toppingRoutes = require('./routes/toppings');
const orderRoutes = require('./routes/orders');

const app = express();
app.use(express.json());

// static admin panel
app.use('/admin', express.static(path.join(__dirname, '../public/admin')));
app.use('/', express.static(path.join(__dirname,'../public/client')));
//app.use('/kitchen', express.static(path.join(__dirname,'../public/kitchen')));

app.use('/api/orders', orderRoutes);
// API routes
app.use('/api/login', authRoutes);
app.use('/api/events', eventRoutes);
//app.use('/api/events/', toppingRoutes);
app.use('/api', toppingRoutes);

const PORT = process.env.PORT || 3000;
//app.listen(PORT, () => console.log(`Server läuft auf ${PORT}`));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
// src/routes/toppings.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.post('/:eventId', auth, async (req, res) => {
  const { eventId } = req.params;
  const { toppings } = req.body;

  for (const t of toppings) {
    await pool.query(
      'INSERT INTO toppings (event_id, name) VALUES ($1, $2)',
      [eventId, t]
    );
  }
  res.json({ ok: true });
});

module.exports = router;
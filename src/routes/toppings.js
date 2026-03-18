// src/routes/toppings.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.post('/events/:eventId/toppings', auth, async (req, res) => {
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

router.get('/events/:eventId/toppings', auth, async (req, res) => {
  const { eventId } = req.params;

  const result = await pool.query(
    'SELECT * FROM toppings WHERE event_id = $1',
    [eventId]
  );

  res.json(result.rows);
});

router.put('/toppings/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const result = await pool.query(
    'UPDATE toppings SET name = $1 WHERE id = $2 RETURNING *',
    [name, id]
  );

  res.json(result.rows[0]);
});

router.delete('/toppings/:id', auth, async (req, res) => {
  const { id } = req.params;

  await pool.query(
    'DELETE FROM toppings WHERE id = $1',
    [id]
  );

  res.send('deleted');
});


router.post('/events/:eventId/topping', auth, async (req, res) => {
  const { eventId } = req.params;
  const { name } = req.body;

  const result = await pool.query(
    'INSERT INTO toppings (event_id, name) VALUES ($1, $2) RETURNING *',
    [eventId, name]
  );

  res.json(result.rows[0]);
});


module.exports = router;
// src/routes/events.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');



router.post('/', auth, async (req, res) => {
  const { name } = req.body;

  const result = await pool.query(
    'INSERT INTO events (name) VALUES ($1) RETURNING *',
    [name]
  );

  res.json(result.rows[0]);
});
router.get('/', auth, async(req,res)=> {
  const events = await pool.query(
    'SELECT * FROM events;'
  );
res.json(events.rows);
});

router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const result = await pool.query(
    'UPDATE events SET name = $1 WHERE id = $2 RETURNING *',
    [name, id]
  );

  res.json(result.rows[0]);
});

router.post('/:id/activate', auth, async (req, res) => {
  const { id } = req.params;

  await pool.query(
    'UPDATE events SET is_active = (id = $1)',
    [id]
  );

  res.send('activated');
});
// get active Event ID i guess
router.get('/active', async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM events WHERE is_active = true LIMIT 1'
  );

  res.json(result.rows[0]);
});

router.get('/active-with-toppings', async (req, res) => {
  const eventResult = await pool.query(
    'SELECT * FROM events WHERE is_active = true LIMIT 1'
  );

  if (eventResult.rows.length === 0) {
    return res.status(404).json({ error: 'No active event' });
  }

  const event = eventResult.rows[0];

  const toppingsResult = await pool.query(
    'SELECT * FROM toppings WHERE event_id = $1',
    [event.id]
  );

  res.json({
    event,
    toppings: toppingsResult.rows
  });
});




module.exports = router ;

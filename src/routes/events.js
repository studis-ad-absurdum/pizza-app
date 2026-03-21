// src/routes/events.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt'); 


router.post('/', auth, async (req, res) => {
  const { name, password } = req.body;
  const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
  const result = await pool.query(
    'INSERT INTO events (name, event_password) VALUES ($1, $2) RETURNING *',
    [name, hashedPassword]
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


// POST /api/events/login
router.post('/login', async (req, res) => {
  const { eventId, password } = req.body;

  try {
    // 1️⃣ Event aus DB holen
    const result = await pool.query(
      'SELECT * FROM events WHERE id = $1 LIMIT 1',
      [eventId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event nicht gefunden' });
    }

    const event = result.rows[0];

    // 2️⃣ Passwort prüfen
    if (!event.event_password) {
      return res.status(403).json({ error: 'Kein Passwort für dieses Event gesetzt' });
    }

    const match = await bcrypt.compare(password, event.event_password);
    if (!match) {
      return res.status(403).json({ error: 'Falsches Passwort' });
    }

    // 3️⃣ Login erfolgreich
    res.json({ success: true, event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Fehler' });
  }
});








module.exports = router ;

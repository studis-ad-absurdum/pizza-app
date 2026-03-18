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



module.exports = router ;

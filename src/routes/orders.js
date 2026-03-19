const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
  const { eventId, toppings, note } = req.body;

  try {
    // 1. Order erstellen
    const orderResult = await pool.query(
      'INSERT INTO orders (event_id, note) VALUES ($1, $2) RETURNING *',
      [eventId,note]
    );

    const order = orderResult.rows[0];

    // 2. Toppings speichern
    for (const toppingId of toppings) {
      await pool.query(
        'INSERT INTO order_items (order_id, topping_id) VALUES ($1, $2)',
        [order.id, toppingId]
      );
    }

    // 🔥 WICHTIG: Order-ID zurückgeben
    res.json({
      success: true,
      orderNumber: order.id
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Fehler');
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.id, o.name, o.created_at, e.name as event_name
      FROM orders o
      JOIN events e ON o.event_id = e.id
      ORDER BY o.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Fehler');
  }
});


/// GET /api/orders/by-ids?ids=1,2,3
router.get('/by-ids', async (req, res) => {
  const ids = req.query.ids.split(',').map(Number);

  const result = await pool.query(`
    SELECT 
      o.id,
      o.validated,
      o.fertig,
      o.note,
      t.name AS topping
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN toppings t ON oi.topping_id = t.id
    WHERE o.id = ANY($1)
    ORDER BY o.id
  `, [ids]);

  const map = {};

  for (const row of result.rows) {
    if (!map[row.id]) {
      map[row.id] = {
        id: row.id,
        validated: row.validated,
        fertig: row.fertig,
        note: row.note,
        toppings: []
      };
    }

    if (row.topping) {
      map[row.id].toppings.push(row.topping);
    }
  }

  res.json(Object.values(map));
});


router.get('/unvalidated/:eventId', async (req, res) => {
  const { eventId } = req.params;

  const result = await pool.query(`
    SELECT 
      o.id,
      o.note,
      o.validated,
      o.fertig,
      t.name AS topping
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN toppings t ON oi.topping_id = t.id
    WHERE o.event_id = $1
      AND o.validated = false
    ORDER BY o.id
  `, [eventId]);

  // 🧠 Gruppieren wie ein Pizza-Organizer
  const map = {};

  for (const row of result.rows) {
    if (!map[row.id]) {
      map[row.id] = {
        id: row.id,
        note: row.note,
        validated: row.validated,
        fertig: row.fertig,
        toppings: []
      };
    }

    if (row.topping) {
      map[row.id].toppings.push(row.topping);
    }
  }

  res.json(Object.values(map));
});


router.patch('/:id/validate', async (req, res) => {
  const { id } = req.params;

  await pool.query(
    'UPDATE orders SET validated = true WHERE id = $1',
    [id]
  );

  res.json({ success: true });
});


router.get('/validated/:eventId', async (req, res) => {
  const { eventId } = req.params;

  const result = await pool.query(`
    SELECT 
      o.id,
      o.note,
      t.name AS topping
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN toppings t ON oi.topping_id = t.id
    WHERE o.event_id = $1
      AND o.validated = true
      AND o.fertig = false
    ORDER BY o.id
  `, [eventId]);

  // 🔥 Gruppieren nach Order
  const ordersMap = {};

  for (const row of result.rows) {
    if (!ordersMap[row.id]) {
      ordersMap[row.id] = {
        id: row.id,
        note: row.note,
        toppings: []
      };
    }

    if (row.topping) {
      ordersMap[row.id].toppings.push(row.topping);
    }
  }

  const orders = Object.values(ordersMap);

  res.json(orders);
});

router.patch('/:id/fertig', async (req, res) => {
  const { id } = req.params;

  await pool.query(
    'UPDATE orders SET fertig = true WHERE id = $1',
    [id]
  );

  res.json({ success: true });
});


module.exports = router;
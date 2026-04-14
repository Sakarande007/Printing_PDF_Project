const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /vendors  – full list (used by PACCAR + individual dropdowns)
router.get('/', authenticateToken, (req, res) => {
  db.query(
    `SELECT id, vendor_name, vendor_code, address_line1, address_line2, country
     FROM vendors ORDER BY vendor_name`,
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Could not load vendors' });
      res.json(result);
    },
  );
});

// GET /vendors/search?q=  – autocomplete for ship-to company field
router.get('/search', authenticateToken, (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.json([]);
  db.query(
    `SELECT id, vendor_name, vendor_code, address_line1, address_line2, country
     FROM vendors
     WHERE vendor_name LIKE ? OR vendor_code LIKE ?
     ORDER BY vendor_name
     LIMIT 10`,
    [`%${q}%`, `%${q}%`],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Search failed' });
      res.json(result);
    },
  );
});

module.exports = router;

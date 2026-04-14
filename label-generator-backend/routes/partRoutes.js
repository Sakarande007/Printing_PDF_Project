const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/:vendorId', authenticateToken, (req, res) => {
  db.query(
    `SELECT id, vendor_id, part_number, description, country_of_origin,
            description_eng, description_fr, description_esp
     FROM parts WHERE vendor_id = ?`,
    [req.params.vendorId],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Could not load parts' });
      res.json(result);
    }
  );
});

module.exports = router;

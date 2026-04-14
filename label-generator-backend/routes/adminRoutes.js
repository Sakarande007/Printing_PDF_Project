const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// ---- Translation helper (individual label only) ----
let translate;
try {
  const gtApi = require('@vitalets/google-translate-api');
  // package exports either { translate } or the function directly
  translate = gtApi.translate || gtApi.default || gtApi;
} catch (_) {
  translate = null;
}

async function translateDesc(text, targetLang) {
  if (!translate || !text || !String(text).trim()) return '';
  try {
    const result = await translate(String(text).trim(), { to: targetLang });
    // result.text or result[0]?.text depending on version
    return result?.text || result?.[0]?.text || '';
  } catch (err) {
    console.warn(`[translate] ${targetLang} failed:`, err.message);
    return '';
  }
}

const router = express.Router();
router.use(authenticateToken, requireAdmin);

router.get('/users', (req, res) => {
  db.query(
    'SELECT id, username, role, created_at FROM users ORDER BY id',
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Could not load users' });
      }
      res.json(rows);
    },
  );
});

router.post('/vendors', (req, res) => {
  const { vendor_name, vendor_code, address_line1, address_line2, country } = req.body || {};
  if (!vendor_name || !String(vendor_name).trim()) {
    return res.status(400).json({ error: 'vendor_name required' });
  }
  const vc  = vendor_code   ? String(vendor_code).trim()   : null;
  const a1  = address_line1 ? String(address_line1).trim() : null;
  const a2  = address_line2 ? String(address_line2).trim() : null;
  const cty = country       ? String(country).trim()       : null;
  db.query(
    `INSERT INTO vendors (vendor_name, vendor_code, address_line1, address_line2, country)
     VALUES (?, ?, ?, ?, ?)`,
    [vendor_name.trim(), vc, a1, a2, cty],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Could not create vendor' });
      res.status(201).json({
        id: result.insertId,
        vendor_name: vendor_name.trim(),
        vendor_code: vc,
        address_line1: a1,
        address_line2: a2,
        country: cty,
      });
    },
  );
});

router.put('/vendors/:id', (req, res) => {
  const { vendor_name, vendor_code, address_line1, address_line2, country } = req.body || {};
  if (!vendor_name || !String(vendor_name).trim()) {
    return res.status(400).json({ error: 'vendor_name required' });
  }
  const vc  = vendor_code   ? String(vendor_code).trim()   : null;
  const a1  = address_line1 ? String(address_line1).trim() : null;
  const a2  = address_line2 ? String(address_line2).trim() : null;
  const cty = country       ? String(country).trim()       : null;
  db.query(
    `UPDATE vendors
     SET vendor_name = ?, vendor_code = ?, address_line1 = ?, address_line2 = ?, country = ?
     WHERE id = ?`,
    [vendor_name.trim(), vc, a1, a2, cty, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Could not update vendor' });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Vendor not found' });
      res.json({
        id: Number(req.params.id),
        vendor_name: vendor_name.trim(),
        vendor_code: vc,
        address_line1: a1,
        address_line2: a2,
        country: cty,
      });
    },
  );
});

router.delete('/vendors/:id', (req, res) => {
  db.query('DELETE FROM vendors WHERE id = ?', [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Could not delete vendor' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    res.status(204).send();
  });
});

router.post('/parts', async (req, res) => {
  const { vendor_id, part_number, description, country_of_origin, description_eng } = req.body || {};
  if (!vendor_id || !part_number || !String(part_number).trim()) {
    return res.status(400).json({ error: 'vendor_id and part_number required' });
  }
  const desc = description != null ? String(description) : '';
  const coo =
    country_of_origin != null && String(country_of_origin).trim()
      ? String(country_of_origin).trim()
      : null;

  // Individual-label descriptions (auto-translate from English)
  const dEng = description_eng != null ? String(description_eng).trim() : '';
  const dFr  = dEng ? await translateDesc(dEng, 'fr')  : '';
  const dEsp = dEng ? await translateDesc(dEng, 'es')  : '';

  db.query(
    `INSERT INTO parts
       (vendor_id, part_number, description, country_of_origin,
        description_eng, description_fr, description_esp)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [vendor_id, part_number.trim(), desc, coo, dEng || null, dFr || null, dEsp || null],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Could not create part' });
      res.status(201).json({
        id: result.insertId,
        vendor_id: Number(vendor_id),
        part_number: part_number.trim(),
        description: desc,
        country_of_origin: coo,
        description_eng: dEng || null,
        description_fr:  dFr  || null,
        description_esp: dEsp || null,
      });
    },
  );
});

router.put('/parts/:id', async (req, res) => {
  const { part_number, description, country_of_origin, description_eng } = req.body || {};
  if (!part_number || !String(part_number).trim()) {
    return res.status(400).json({ error: 'part_number required' });
  }
  const desc = description != null ? String(description) : '';
  const coo =
    country_of_origin != null && String(country_of_origin).trim()
      ? String(country_of_origin).trim()
      : null;

  // Individual-label descriptions (auto-translate from English)
  const dEng = description_eng != null ? String(description_eng).trim() : '';
  const dFr  = dEng ? await translateDesc(dEng, 'fr')  : '';
  const dEsp = dEng ? await translateDesc(dEng, 'es')  : '';

  db.query(
    `UPDATE parts
     SET part_number = ?, description = ?, country_of_origin = ?,
         description_eng = ?, description_fr = ?, description_esp = ?
     WHERE id = ?`,
    [part_number.trim(), desc, coo, dEng || null, dFr || null, dEsp || null, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Could not update part' });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Part not found' });
      res.json({
        id: Number(req.params.id),
        part_number: part_number.trim(),
        description: desc,
        country_of_origin: coo,
        description_eng: dEng || null,
        description_fr:  dFr  || null,
        description_esp: dEsp || null,
      });
    },
  );
});

router.delete('/parts/:id', (req, res) => {
  db.query('DELETE FROM parts WHERE id = ?', [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Could not delete part' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Part not found' });
    }
    res.status(204).send();
  });
});

router.post('/users', (req, res) => {
  const { username, password, role } = req.body || {};
  if (!username || !password || !String(username).trim()) {
    return res.status(400).json({ error: 'username and password required' });
  }
  const r = role === 'admin' ? 'admin' : 'user';
  bcrypt.hash(password, 10, (hashErr, password_hash) => {
    if (hashErr) {
      return res.status(500).json({ error: 'Could not create user' });
    }
    db.query(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
      [username.trim(), password_hash, r],
      (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Username already exists' });
          }
          return res.status(500).json({ error: 'Could not create user' });
        }
        res.status(201).json({
          id: result.insertId,
          username: username.trim(),
          role: r,
        });
      },
    );
  });
});

module.exports = router;

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  db.query(
    'SELECT id, username, password_hash, role FROM users WHERE username = ?',
    [username.trim()],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Login failed' });
      }
      const user = rows[0];
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      bcrypt.compare(password, user.password_hash).then((ok) => {
        if (!ok) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign(
          { id: user.id, username: user.username, role: user.role },
          JWT_SECRET,
          { expiresIn: '7d' },
        );
        res.json({
          token,
          user: { id: user.id, username: user.username, role: user.role },
        });
      }).catch(() => res.status(500).json({ error: 'Login failed' }));
    },
  );
});

router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: { id: req.user.id, username: req.user.username, role: req.user.role } });
});

module.exports = router;

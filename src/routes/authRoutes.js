const express = require('express');
const { hashPassword, comparePassword, generateToken } = require('../services/authService');

const createAuthRoutes = (User) => {
  const router = express.Router();

  router.post('/signup', async (req, res) => {
    const { email, password, role = 'tenant', tenantId } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (role === 'tenant' && !tenantId) {
      return res.status(400).json({ error: 'tenantId is required for tenant users' });
    }

    try {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const passwordHash = await hashPassword(password);
      const user = await User.create({ email, passwordHash, role, tenantId: tenantId || null });
      const token = generateToken({ userId: user._id, email: user.email, role: user.role, tenantId: user.tenantId });

      res.status(201).json({ token, user: { email: user.email, role: user.role, tenantId: user.tenantId } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Could not create user' });
    }
  });

  router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const valid = await comparePassword(password, user.passwordHash);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

      const token = generateToken({ userId: user._id, email: user.email, role: user.role, tenantId: user.tenantId });
      res.json({ token, user: { email: user.email, role: user.role, tenantId: user.tenantId } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  return router;
};

module.exports = createAuthRoutes;
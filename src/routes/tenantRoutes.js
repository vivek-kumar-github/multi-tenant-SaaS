const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
const { logAudit } = require('../services/gitService');

const createTenantRoutes = (TenantConfig, ensureTenantConfigFile) => {
  const router = express.Router();

  router.get('/config', authMiddleware, async (req, res) => {
    const tenantId = req.user.role === 'admin' ? req.query.tenantId : req.user.tenantId;
    if (!tenantId) return res.status(400).json({ error: 'Tenant context is required' });

    try {
      const row = await TenantConfig.findOne({ tenantId });
      if (!row) return res.status(404).json({ error: 'Tenant config not found' });

      res.json({ tenantId, settings: row.settings });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Could not read tenant config' });
    }
  });

  router.post('/config', authMiddleware, async (req, res) => {
    const tenantId = req.user.tenantId;
    if (!tenantId) return res.status(403).json({ error: 'Tenant token required for tenant routes' });

    try {
      const settings = req.body;

      const saved = await TenantConfig.findOneAndUpdate(
        { tenantId },
        { settings, lastUpdated: new Date() },
        { upsert: true, new: true }
      );

      await ensureTenantConfigFile(tenantId, settings);
      logAudit(tenantId, req.user.id, 'tenant-config-update');

      res.json({ message: 'Tenant config updated', config: saved });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Could not update config' });
    }
  });

  return router;
};

module.exports = createTenantRoutes;

const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { logAudit, readAuditLog } = require('../services/gitService');

const createAdminRoutes = (TenantConfig, ensureTenantConfigFile) => {
  const router = express.Router();

  router.post('/tenant', authMiddleware, requireRole('admin'), async (req, res) => {
    const { tenantId, settings = {} } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    try {
      const existing = await TenantConfig.findOne({ tenantId });
      if (existing) {
        return res.status(409).json({ error: 'Tenant already exists' });
      }

      const created = await TenantConfig.create({ tenantId, settings, lastUpdated: new Date() });
      await ensureTenantConfigFile(tenantId, settings);
      logAudit(tenantId, req.user.id, 'admin-create-tenant');

      res.status(201).json({ message: 'Tenant created', tenant: created });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Could not create tenant' });
    }
  });

  router.get('/tenants', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
      const tenants = await TenantConfig.find({}, 'tenantId lastUpdated settings');
      res.json({ tenants });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Could not fetch tenants' });
    }
  });

  router.get('/audit', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
      const logs = await readAuditLog();
      res.json({ logs });
    } catch (err) {
      console.error('Audit fetch failed:', err);
      res.status(500).json({ error: 'Could not read audit logs', details: err.message });
    }
  });

  return router;
};

module.exports = createAdminRoutes;
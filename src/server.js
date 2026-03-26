const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const connectDB = require('./services/dbService');
const { logAudit } = require('./services/gitService');
const { hashPassword, comparePassword, generateToken } = require('./services/authService');
const authMiddleware = require('./middleware/authMiddleware');
const { requireRole } = require('./middleware/roleMiddleware');

const app = express();
app.use(express.json());

const TENANT_DIR = path.resolve(__dirname, '..', 'data', 'tenants');

let TenantConfig;
let User;

const ensureTenantConfigFile = async (tenantId, config) => {
  const tenantDir = path.join(TENANT_DIR, tenantId);
  const filePath = path.join(tenantDir, 'config.json');

  await fs.mkdir(tenantDir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify({ tenantId, ...config }, null, 2), 'utf8');

  try {
    await fs.chmod(tenantDir, 0o700);
    await fs.chmod(filePath, 0o600);
  } catch (err) {
    console.warn('Could not set Unix permissions (platform maybe windows):', err.message);
  }
};

connectDB().then(models => {
  TenantConfig = models.TenantConfig;
  User = models.User;
  console.log('MongoDB Connected & Indexed');
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

app.post('/auth/signup', async (req, res) => {
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

    res.status(201).json({ message: 'Account created', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create user' });
  }
});

app.post('/auth/login', async (req, res) => {
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
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/tenant/config', authMiddleware, async (req, res) => {
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

app.post('/tenant/config', authMiddleware, async (req, res) => {
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

app.post('/admin/tenant', authMiddleware, requireRole('admin'), async (req, res) => {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

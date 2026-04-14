const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const cors = require('cors');
const connectDB = require('./services/dbService');
const authMiddleware = require('./middleware/authMiddleware');

// Import route creators
const createAuthRoutes = require('./routes/authRoutes');
const createTenantRoutes = require('./routes/tenantRoutes');
const createAdminRoutes = require('./routes/adminRoutes');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
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
  
  // Mount routes
  app.use('/auth', createAuthRoutes(User));
  app.use('/tenant', createTenantRoutes(TenantConfig, ensureTenantConfigFile));
  app.use('/admin', createAdminRoutes(TenantConfig, ensureTenantConfigFile));
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

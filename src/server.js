const express = require('express');
const { logAudit } = require('./services/gitService');
const isolateTenant = require('./middleware/authMiddleware');

const app = express();
const PORT = 3000;

// Middleware to let Express understand JSON data sent in requests
app.use(express.json());

// 1. A public route (No isolation needed)
app.get('/', (req, res) => {
    res.send("SaaS Configuration System is Running! 🚀");
});

// 2. A Private/Isolated route (Uses our middleware)
// Notice how we put 'isolateTenant' here to protect this route
app.post('/api/config', isolateTenant, (req, res) => {
    const { tenantId } = req; // Provided by our middleware
    const updatedConfig = req.body;

    console.log(`Processing update for ${tenantId}...`);

    logAudit(tenantId);

    res.json({
        message: `Configuration updated for ${tenantId}`,
        auditStatus: "Git commit triggered",
        dataReceived: updatedConfig
    });
});

app.listen(PORT, () => {
    console.log(`✅ Server is live at http://localhost:${PORT}`);
});
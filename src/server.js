const express = require('express');
const { logAudit } = require('./services/gitService');
const authMiddleware = require('./middleware/authMiddleware');
// 1. Import the database connection
const connectDB = require('./services/dbService');

const app = express();
app.use(express.json());

// 2. Initialize variables for our Database Model
let TenantConfig;

// 3. Connect to MongoDB BEFORE starting the server
connectDB().then(model => {
    TenantConfig = model;
    console.log("🍃 MongoDB Connected & Indexed");
}).catch(err => {
    console.error("Failed to connect to MongoDB:", err);
});

app.post('/update-config', authMiddleware, async (req, res) => {
    const tenantId = req.headers['x-tenant-id'];
    console.log(`Processing update for ${tenantId}...`);

    try {
        // 4. Save to MongoDB (The New Layer)
        await TenantConfig.findOneAndUpdate(
            { tenantId: tenantId },
            { settings: req.body, lastUpdated: new Date() },
            { upsert: true, new: true }
        );

        // 5. Trigger the Git Audit (The Existing Layer)
        logAudit(tenantId);

        res.status(200).send({ message: `Config updated and indexed for ${tenantId}` });
    } catch (error) {
        res.status(500).send({ error: "Database update failed" });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Server is live at http://localhost:3000`);
});
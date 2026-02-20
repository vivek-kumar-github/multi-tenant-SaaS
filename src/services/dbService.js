const mongoose = require('mongoose');

// This is the blueprint for your tenant data
const tenantConfigSchema = new mongoose.Schema({
    tenantId: { 
        type: String, 
        required: true, 
        unique: true,
        index: true // <--- THIS is the dedicated index for isolation
    },
    settings: {
        type: Object,
        default: {}
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

const connectDB = async () => {
    try {
        // We use a local DB named 'saas_db'
        await mongoose.connect('mongodb://127.0.0.1:27017/saas_db');
        console.log("🍃 MongoDB Connected & Indexed");
        
        // Return the Model so we can use it to save data
        return mongoose.model('TenantConfig', tenantConfigSchema);
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
        process.exit(1);
    }
};

module.exports = connectDB;
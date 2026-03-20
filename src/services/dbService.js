const mongoose = require('mongoose');

const tenantConfigSchema = new mongoose.Schema({
    tenantId: { 
        type: String, 
        required: true, 
        unique: true,
        index: true
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
        await mongoose.connect('mongodb://127.0.0.1:27017/saas_db');
        return mongoose.model('TenantConfig', tenantConfigSchema);
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
        process.exit(1);
    }
};

module.exports = connectDB;
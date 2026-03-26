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

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['tenant', 'admin'],
        default: 'tenant'
    },
    tenantId: {
        type: String,
        required: function () {
            return this.role === 'tenant';
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

let models = null;

const connectDB = async () => {
    if (models) {
        return models;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/saas_db');

        const TenantConfig = mongoose.models.TenantConfig || mongoose.model('TenantConfig', tenantConfigSchema);
        const User = mongoose.models.User || mongoose.model('User', userSchema);

        models = { TenantConfig, User };
        return models;
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;
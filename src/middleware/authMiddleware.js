const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization header missing or invalid' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const secret = process.env.JWT_SECRET || 'super-secret-dev-key';
        const payload = jwt.verify(token, secret);

        // Tenant scoping
        if (!payload.tenantId && payload.role !== 'admin') {
            return res.status(403).json({ error: 'Tenant context required' });
        }

        req.user = {
            id: payload.userId,
            email: payload.email,
            role: payload.role,
            tenantId: payload.tenantId || null
        };

        if (req.headers['x-tenant-id'] && req.user.tenantId && req.headers['x-tenant-id'] !== req.user.tenantId) {
            return res.status(403).json({ error: 'Tenant ID mismatch' });
        }

        req.tenantId = req.user.tenantId;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token verification failed', details: err.message });
    }
};

module.exports = authMiddleware;
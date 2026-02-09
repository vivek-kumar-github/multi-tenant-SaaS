// src/middleware/authMiddleware.js

const isolateTenant = (req, res, next) => {
    // We expect the tenant ID to be sent in a header called 'x-tenant-id'
    const tenantId = req.headers['x-tenant-id'];

    if (!tenantId) {
        // If no ID is provided, we stop the request here.
        return res.status(403).json({ 
            error: "Security Violation: No Tenant ID provided." 
        });
    }

    // Attach the tenantId to the 'req' object so all our routes can use it
    req.tenantId = tenantId;
    
    console.log(`🔒 Request isolated for tenant: ${tenantId}`);
    
    // Move to the next function
    next();
};

module.exports = isolateTenant;
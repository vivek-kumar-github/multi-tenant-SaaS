
const isolateTenant = (req, res, next) => {
    const tenantId = req.headers['x-tenant-id'];

    if (!tenantId) {
        return res.status(403).json({ 
            error: "Security Violation: No Tenant ID provided." 
        });
    }

    req.tenantId = tenantId;
    
    console.log(`Request isolated for tenant: ${tenantId}`);
    
    next();
};

module.exports = isolateTenant;
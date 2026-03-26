const { exec } = require('child_process');

const logAudit = (tenantId, userId = 'unknown', action = 'update-config') => {
    const msg = `Audit: ${action} for tenant ${tenantId} by ${userId} @ ${new Date().toISOString()}`;
    const filePath = `tenants/${tenantId}/config.json`;

    const command = `cd data && git add ${filePath} && git commit -m "${msg}" || echo "No changes to commit"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Git Audit Error: ${error.message}`);
            return;
        }
        console.log(`Audit Entry: ${msg}`);
    });
};

module.exports = { logAudit };
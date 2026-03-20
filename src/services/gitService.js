const { exec } = require('child_process');

const logAudit = (tenantId) => {
    const command = `cd data && git add tenants/${tenantId}/config.json && git commit -m "Audit: Updated config for ${tenantId}" || echo "No changes to commit"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Git Audit Error: ${error.message}`);
            return;
        }
        console.log(`✅ Audit Status: ${stdout || 'File tracked'}`);
    });
};

module.exports = { logAudit };
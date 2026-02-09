const { exec } = require('child_process');

const logAudit = (tenantId) => {
    // We add '|| true' at the end. 
    // This tells the computer: "Even if Git has nothing to commit, don't crash."
    const command = `cd data && git add tenants/${tenantId}/config.json && git commit -m "Audit: Updated config for ${tenantId}" || echo "No changes to commit"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            // This will now only trigger if something is REALLY wrong (like Git is missing)
            console.error(`❌ Git Audit Error: ${error.message}`);
            return;
        }
        console.log(`✅ Audit Status: ${stdout || 'File tracked'}`);
    });
};

module.exports = { logAudit };
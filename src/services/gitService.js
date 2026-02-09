// We use 'child_process' to run terminal commands from inside JavaScript
const { exec } = require('child_process');

/**
 * This function will automatically 'git add' and 'git commit' 
 * whenever a tenant's config is updated.
 */
const logAudit = (tenantId) => {
    // The command: go to data folder, add the specific tenant's file, and commit it
    const command = `cd data && git add tenants/${tenantId}/config.json && git commit -m "Audit: Updated config for ${tenantId}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Git Audit Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`Git Status: ${stderr}`);
            return;
        }
        console.log(`✅ Audit Successful: ${stdout}`);
    });
};

// Export the function so we can use it in our server later
module.exports = { logAudit };
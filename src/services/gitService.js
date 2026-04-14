const { exec, execFile } = require('child_process');
const path = require('path');

const gitCommand = process.env.GIT_PATH || 'git';

const logAudit = (tenantId, userId = 'unknown', action = 'update-config') => {
    const msg = `Audit: ${action} for tenant ${tenantId} by ${userId} @ ${new Date().toISOString()}`;
    const filePath = `tenants/${tenantId}/config.json`;
    const dataDir = path.resolve(__dirname, '..', '..', 'data');

    const handleError = (error) => {
        if (error.code === 'ENOENT') {
            console.warn('Git is not installed or not available in PATH. Audit commit skipped.');
            return true;
        }
        return false;
    };

    execFile(gitCommand, ['add', filePath], { cwd: dataDir, windowsHide: true }, (addError) => {
        if (addError) {
            if (handleError(addError)) return;
            console.error(`Git Audit Add Error: ${addError.message}`);
            return;
        }

        execFile(gitCommand, ['commit', '-m', msg], { cwd: dataDir, windowsHide: true }, (commitError, stdout, stderr) => {
            if (commitError) {
                if (handleError(commitError)) return;
                if (stderr && /nothing to commit/i.test(stderr)) {
                    console.log('Git Audit: no changes to commit');
                    return;
                }
                console.error(`Git Audit Commit Error: ${commitError.message}`);
                return;
            }
            console.log(`Audit Entry: ${msg}`);
        });
    });
};

const readAuditLog = () => {
    return new Promise((resolve, reject) => {
        const dataDir = path.resolve(__dirname, '..', '..', 'data');
        execFile(
            gitCommand,
            ['log', '--pretty=format:%h|%an|%ad|%s', '--date=iso', '--', 'tenants'],
            { cwd: dataDir, windowsHide: true },
            (error, stdout, stderr) => {
                if (error) {
                    if (error.code === 'ENOENT') {
                        console.warn('Git is not installed or not available in PATH. Audit logs are unavailable.');
                        resolve([]);
                        return;
                    }
                    const message = stderr ? `${stderr.trim()} (${error.message})` : error.message;
                    reject(new Error(message));
                    return;
                }
                const lines = stdout
                    .split('\n')
                    .filter(Boolean)
                    .map(line => {
                        const [hash, author, date, message] = line.split('|');
                        return { hash, author, date, message };
                    });
                resolve(lines);
            }
        );
    });
};

module.exports = { logAudit, readAuditLog };
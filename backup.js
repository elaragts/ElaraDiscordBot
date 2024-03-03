const {exec} = require('child_process');
const path = require('path');
const fs = require('fs');
const dbPath = path.join(__dirname, 'taiko.db3');
const {backupChannelId} = require('./config.json');

async function backupAndUpload(client) {
    const channel = client.channels.cache.get(backupChannelId);
    if (!channel) {
        console.error('Channel not found');
        return;
    }

    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFilePath = path.join(__dirname, `taiko-${timestamp}.db3`);

        exec(`sqlite3 ${dbPath} ".backup '${backupFilePath}'"`, async (error, stdout, stderr) => {
            if (error) {
                console.error(`Backup failed: ${error}`);
                return;
            }

            await channel.send({
                files: [backupFilePath]
            }).then(() => {
                // Delete the backup file after successful upload
                fs.unlink(backupFilePath, (err) => {
                    if (err) {
                        console.error('Failed to delete backup file:', err);
                    }
                });
            });
        });
    } catch (error) {
        console.error('Failed to backup and upload:', error);
    }
}

module.exports = {backupAndUpload};
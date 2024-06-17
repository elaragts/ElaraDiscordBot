require('module-alias/register');
const bot = require('@bot');

bot.run();

process.on('SIGINT', async () => {
    console.log('Exiting Gracefully...');
    try {
        for (const [Baid, value] of bot.playerFavouritedSongs.entries()) {
            console.log(`${Baid}: ${value}`);
            taikodb.setFavouriteSongsArray(Baid, value);
        }
    } catch (error) {
        console.error('Cleanup encountered an error:', error);
    } finally {
        process.exit(0);
    }
});
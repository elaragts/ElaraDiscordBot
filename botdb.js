/**
 * botdb.js
 *
 * Functions related to querying the discord bot db
 */

const Database = require('better-sqlite3');
const db = new Database('./bot.db3');

const insertUser = db.prepare('INSERT INTO user (discordId, accessCode) VALUES (?, ?)');
const deleteUser = db.prepare('DELETE FROM user WHERE discordId = ?');
const selectDiscordIdFromAC = db.prepare('SELECT discordId FROM user WHERE accessCode = ?').pluck();
const selectACFromDiscordId = db.prepare('SELECT accessCode FROM user WHERE discordId = ?').pluck();


const linkDiscord = (discordId, accessCode) => {
    insertUser.run(discordId, accessCode);
}

const unlinkDiscord = (discordId) => {
    deleteUser.run(discordId);
}

const getDiscordIdFromAccessCode = (accessCode) => {
    return selectDiscordIdFromAC.get(accessCode);
}

const getAccessCodeFromDiscordId = (discordId) => {
    return selectACFromDiscordId.get(discordId);
}


module.exports = { linkDiscord, unlinkDiscord, getDiscordIdFromAccessCode, getAccessCodeFromDiscordId };
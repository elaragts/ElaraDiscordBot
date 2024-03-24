/**
 * botdb.js
 *
 * Functions related to querying the discord bot db
 */

const Database = require('better-sqlite3');
const db = new Database('./bot.db3');
const taikoDB = require('@taikodb');

const insertUser = db.prepare('INSERT INTO user (discordId, Baid) VALUES (?, ?)');
const deleteUser = db.prepare('DELETE FROM user WHERE discordId = ?');
const selectACFromDiscordId = db.prepare('SELECT accessCode FROM user WHERE discordId = ?').pluck();
const selectBaidFromDiscordId = db.prepare('SELECT Baid FROM user WHERE discordId = ?').pluck();
const selectDiscordIdFromBaid = db.prepare('SELECT discordId FROM user WHERE Baid = ?').pluck();
const addBaid = db.prepare('UPDATE user SET Baid = ? WHERE accessCode = ?');
const linkDiscord = (discordId, baid) => {
    insertUser.run(discordId, baid);
}

const unlinkDiscord = (discordId) => {
    deleteUser.run(discordId);
}

const getAccessCodeFromDiscordId = (discordId) => {
    return selectACFromDiscordId.get(discordId);
}

const getBaidFromDiscordId = (discordId) => {
    const res = selectBaidFromDiscordId.get(discordId);
    if (res === undefined) {
        const accessCode = getAccessCodeFromDiscordId(discordId);
        if (accessCode === undefined) return undefined;
        else {
            const baid = taikoDB.getBaidFromAccessCode(accessCode);
            addBaid.run(baid, accessCode);
            return baid;
        }
    }
    return res;
}
const getDiscordIdFromBaid = (baid) => {
    const res = selectDiscordIdFromBaid.get(baid);
    if (res === undefined) {
        const accessCode = taikoDB.getAccessCodeFromBaid(baid);
        if (accessCode === undefined) return undefined;
        else {
            addBaid.run(baid, accessCode);
            return selectDiscordIdFromBaid.get(baid);
        }
    }
    return res;
}

module.exports = { linkDiscord, unlinkDiscord, getBaidFromDiscordId, getDiscordIdFromBaid};
/**
 * taikodb.js
 *
 * Functions related to querying the taiko db
 */

const Database = require('better-sqlite3');
const db = new Database('./taiko.db3', { readonly: true });

//statements
const lb = db.prepare('SELECT ud.MyDonName, c.AccessCode, sbd.BestScore, sbd.BestCrown, sbd.BestScoreRank FROM SongBestData sbd INNER JOIN UserData ud ON sbd.Baid = ud.Baid INNER JOIN Card c ON sbd.Baid = c.Baid WHERE SongID = ? AND Difficulty = ? ORDER BY sbd.BestScore DESC LIMIT 10')
const selectBaidFromAccessCode = db.prepare('SELECT Baid FROM Card WHERE AccessCode = ?').pluck();
const selectBestScore = db.prepare('SELECT BestScore FROM SongBestData WHERE SongID = ? AND Difficulty = ? AND Baid = ?').pluck();
const selectPlayByScore = db.prepare('SELECT ud.MyDonName, spd.Score, spd.ComboCount, spd.Crown, spd.ScoreRank, spd.DrumrollCount, spd.GoodCount, spd.MissCount, spd.OkCount, c.AccessCode FROM SongPlayData spd INNER JOIN UserData ud ON spd.Baid = ud.Baid INNER JOIN Card c ON spd.Baid = c.baid WHERE spd.SongID = ? AND spd.Difficulty = ? AND spd.Baid = ? AND spd.Score = ? ORDER BY spd.Id')
const getLeaderboard = (uniqueId, difficulty) => {
    return lb.all(uniqueId, difficulty);
}

const getBestScore = (uniqueId, difficulty, Baid) => {
    const score = selectBestScore.get(uniqueId, difficulty, Baid);
    if (score === undefined) return undefined;
    return selectPlayByScore.get(uniqueId, difficulty, Baid, score);
}
const getBaidFromAccessCode = (accessCode) => {
    return selectBaidFromAccessCode.get(accessCode);
}


const difficultyIdToName = (difficultyId, lang) => {
    switch (lang) {
        case 0:
            switch (difficultyId) {
                case 1:
                    return 'かんたん';
                case 2:
                    return 'ふつう';
                case 3:
                    return 'むずかしい';
                case 4:
                    return 'おに';
                case 5:
                    return 'おに (裏)';
                default:
                    throw new Error(`Unknown Difficulty ${difficultyId}`);
            }
        case 1:
            switch (difficultyId) {
                case 1:
                    return 'Easy';
                case 2:
                    return 'Normal';
                case 3:
                    return 'Hard';
                case 4:
                    return 'Oni';
                case 5:
                    return 'Ura Oni';
                default:
                    throw new Error(`Unknown difficulty ${difficultyId}`);
            }
        default:
            throw new Error(`Unknown language ${lang}`);
    }
}
module.exports = { getLeaderboard, getBaidFromAccessCode, difficultyIdToName, getBestScore };
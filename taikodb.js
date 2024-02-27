/**
 * taikodb.js
 *
 * Functions related to querying the taiko db
 */
const fs = require('fs');
const path = require('path');
const queries = path.join(__dirname, 'queries');
const Database = require('better-sqlite3');
const db = new Database('./taiko.db3', { readonly: true });
const profileQuery = fs.readFileSync(path.join(queries, 'profile.sql'), 'utf8');
const leaderboardQuery = fs.readFileSync(path.join(queries, 'leaderboard.sql'), 'utf8');
const baidFromAccessCodeQuery = fs.readFileSync(path.join(queries, 'baidFromAccessCode.sql'), 'utf8');
const bestScoreQuery = fs.readFileSync(path.join(queries, 'bestScore.sql'), 'utf8');
const playByScoreQuery = fs.readFileSync(path.join(queries, 'playByScore.sql'), 'utf8');


//statements
const lb = db.prepare(leaderboardQuery);
const selectBaidFromAccessCode = db.prepare(baidFromAccessCodeQuery).pluck();
const selectBestScore = db.prepare(bestScoreQuery);
const selectPlayByScore = db.prepare(playByScoreQuery);
const selectPlayerProfile = db.prepare(profileQuery);

const getLeaderboard = (uniqueId, difficulty) => {
    return lb.all(uniqueId, difficulty);
}

const getBestScore = (uniqueId, difficulty, Baid) => {
    const score = selectBestScore.get(uniqueId, difficulty, Baid);
    if (score === undefined) return undefined;
    let ret = selectPlayByScore.get(uniqueId, difficulty, Baid, score.BestScore);
    ret.crown = score.BestCrown;
    return ret;
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

const getPlayerProfile = (Baid) => {
    return selectPlayerProfile.get({ Baid: Baid });
}
module.exports = { getLeaderboard, getBaidFromAccessCode, difficultyIdToName, getBestScore, getPlayerProfile };
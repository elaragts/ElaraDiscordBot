/**
 * data.js
 *
 * Helper functions involving parsing wordlist.json and musicinfo.json
 */
const wordlist = require('./data/datatable/wordlist.json');
const musicinfo = require('./data/datatable/musicinfo.json');
const eventfolderdata = require('./data/event_folder_data.json');
const songs = {}; //uniqueId: {id, titles: [jp, en]}
var initialized = false;

//Error Checks
const checkUniqueId = (uniqueId, location) => {
    if (!(uniqueId in songs)) throw new Error("Song not found! (uniqueId: " + uniqueId + ", location: " + location + ")");
}

const checkEventFolder = (folderId, location) => {
    if (!isEventFolderPresent(folderId)) throw new Error("Event folder not found! (folderId: " + folderId + ", location: " + location + ")");
}

const checkLang = (lang, location) => {
    if (!isLangInRange(lang)) throw new Error("Lang out of range! (lang: " + lang + ", location: " + location + ")");
}

const checkGenreId = (genreId, location) => {
    if (!isGenreInRange(genreId)) throw new Error("GenreId out of range! (genreNo: " + genreNo + ", location: " + location + ")");
}

//create song object
const getMusicInfoFromId = (id) => {
    for (let i in musicinfo.items) {
        if (musicinfo.items[i].id === id) {
            return [
                musicinfo.items[i].uniqueId,
                [
                    musicinfo.items[i].starEasy,
                    musicinfo.items[i].starNormal,
                    musicinfo.items[i].starHard,
                    musicinfo.items[i].starMania,
                    musicinfo.items[i].starUra,
                ],
                musicinfo.items[i].genreNo,
                musicinfo.items[i].papamama
            ]
        }
    }
    throw new Error('Failed to load musicinfo for ' + id + '!');
}

const isSongInEvent = (uniqueId, folderId) => {
    if (initialized) checkUniqueId(uniqueId, 'isSongInEvent');
    checkUniqueId(uniqueId, 'isSongInEvent');
    checkEventFolder(folderId, '');
    let index = 0;
    for (let i in eventfolderdata) {
        if (eventfolderdata[i].folderId === folderId) index = i;
    }

    return eventfolderdata[index].songNo.includes(parseInt(uniqueId));
}

const getEventSongs = (folderId) => {
    checkEventFolder(folderId, 'getEventSongs');
    for (let i of eventfolderdata) {
        if (i.folderId == folderId) {
            return i.songNo;
        }
    }
    throw new Error("How did this even happen? (-_-;)");
}

const isEventFolderPresent = (folderId) => {
    for (let i of eventfolderdata) {
        if (i.folderId === folderId) return true;
    }

    return false;
}

//create song object
for (let i in wordlist.items) {
    if (wordlist.items[i].key.startsWith('song') && !wordlist.items[i].key.startsWith('song_sub') && !wordlist.items[i].key.startsWith('song_detail')) {
        const id = wordlist.items[i].key.slice(5); //remove song_ from id
        const [uniqueId, difficulty, genreNo] = getMusicInfoFromId(id);
        if (uniqueId in songs) continue;
        let folder = -1;
        for (let i in eventfolderdata) {
            if (isSongInEvent(uniqueId, eventfolderdata[i].folderId)) folder = eventfolderdata[i].folderId;
        }

        //Priority event folders
        if (isSongInEvent(uniqueId, 10)) folder = 10;
        else if (isSongInEvent(uniqueId, 8)) folder = 8;
        else if (isSongInEvent(uniqueId, 9)) folder = 9;
        else if (isSongInEvent(uniqueId, 3)) folder = 3;
        songs[uniqueId] = { 'id': id, titles: [wordlist.items[i].japaneseText, wordlist.items[i].englishUsText], 'difficulty': difficulty, 'genreNo': genreNo, 'folder': folder };
    }
}
initialized = true;

/**
 * Searches for songs given a query
 * @param query Query
 */
const searchSongs = (query) => {
    query = query.toLowerCase();
    for (let song in songs) {
        for (let i in songs[song].titles) {
            if (songs[song].titles[i].toLowerCase() === query) return [song, i]; //return the song if there is an exact match
        }
    }
    return [];
}

/**
 * Returns autocomplete results for song search
 * @param query
 * @returns {Promise<string[]>}
 */
const autocomplete = async (query) => {
    return new Promise((resolve, reject) => {
        try {
            if (query === '') resolve([]);
            query = query.toLowerCase();
            let results = []; // Return array
            for (let song in songs) {
                for (let i in songs[song].titles) {
                    if (songs[song].titles[i].toLowerCase() === query) {
                        // Return the song if there is an exact match
                        resolve([[songs[song].titles[i], `${song}|${i}`]]);
                        return;
                    }
                    if (songs[song].titles[i].toLowerCase().includes(query)) {
                        // Append the song for a partial match
                        if (results.length < 10) results.push([songs[song].titles[i], `${song}|${i}`]); // Limit results to 10
                    }
                }
            }
            resolve(results); // Resolve with all collected results
        } catch (error) {
            reject(error); // Reject the promise in case of an error
        }
    });
};

/**
 * Returns song name given uniqueId
 * @param uniqueId
 * @param lang language (0 = JP, 1 = EN)
 * @returns {*}
 */
const getSongName = (uniqueId, lang) => {
    checkUniqueId(uniqueId, 'getSongName');
    checkLang(lang, 'getSongName');
    return songs[uniqueId].titles[lang];
}

const getSongStars = (uniqueId, difficulty) => {
    checkUniqueId(uniqueId, 'getSongStars');
    return songs[uniqueId].difficulty[difficulty - 1];
}

const getEventFromSong = (uniqueId) => {
    checkUniqueId(uniqueId, 'getEventFromSong');
    return songs[uniqueId].folder;
}

//Converts folder id to name with language.
const folderIdToName = (folderId, lang) => {
    checkEventFolder(folderId, 'folderIdToName');
    checkLang(lang, 'folderIdToName');
    for (let i of eventfolderdata) {
        if (i.folderId === folderId) {
            for (let j of wordlist.items) {
                if (j.key === "folder_event" + folderId) {
                    switch (lang) {
                        case 0: return j.japaneseText;
                        case 1: return j.englishUsText;
                    }
                }
            }
        }
    }
}

const genreIdToName = (genreId, lang) => {
    checkGenreId(genreId, 'genreIdToName');
    checkLang(lang, 'genreIdToName')
    switch (lang) {
        case 0: switch (genreId) {
            case 0: return 'ポップス'
            case 1: return 'アニメ'
            case 2: return 'キッズ'
            case 3: return 'ボーカロイド™曲'
            case 4: return 'ゲームミュージック'
            case 5: return 'ナムコオリジナル'
            case 6: return 'バラエティ'
            case 7: return 'クラシック'
        }
        case 1: switch (genreId) {
            case 0: return 'POP'
            case 1: return 'Anime'
            case 2: return 'Kids\''
            case 3: return 'VOCALOID™ Music'
            case 4: return 'Game Music'
            case 5: return 'NAMCO Original'
            case 6: return 'Variety'
            case 7: return 'Classical'
        }
    }
}

/**
 * Returns if song with uniqueId is present in song list
 * @param uniqueId
 * @returns {boolean}
 */
const isSongPresent = (uniqueId) => {
    return uniqueId in songs;
}

/**
 * Returns if lang value is in range
 * @param lang
 * @returns {boolean}
 */
const isLangInRange = (lang) => {
    return lang >= 0 && lang <= 1;
}

const isGenreInRange = (genreNo) => {
    return genreNo >= 0 && genreNo <= 7;
}
module.exports = { searchSongs, autocomplete, getSongName, isSongPresent, isLangInRange, getSongStars, getEventSongs, isSongInEvent, getEventFromSong, folderIdToName, isGenreInRange, isEventFolderPresent, genreIdToName };
/**
 * data.js
 *
 * Helper functions involving parsing wordlist.json and musicinfo.json
 */
const wordlist = require('./data/datatable/wordlist.json');
const musicinfo = require('./data/datatable/musicinfo.json');

const songs = {}; //uniqueId: {id, titles: [jp, en]}

/**
 * Gets song's uniqueId given Id
 * @param id
 * @returns {number|*}
 */
const getUniqueSongIdFromId = (id) => {
    for (let i in musicinfo.items) {
        if (musicinfo.items[i].id === id) return musicinfo.items[i].uniqueId;
    }
    return -1;
}

//create song object
for (let i in wordlist.items) {
    if (wordlist.items[i].key.startsWith('song') && !wordlist.items[i].key.startsWith('song_sub') && !wordlist.items[i].key.startsWith('song_detail')) {
        const id = wordlist.items[i].key.slice(5); //remove song_ from id
        const uniqueId = getUniqueSongIdFromId(id);
        if (uniqueId in songs) continue;
        songs[uniqueId] = {'id': id, titles : [wordlist.items[i].japaneseText, wordlist.items[i].englishUsText] };
    }
}

/**
 * Searches for songs given a query
 * @param query Query
 */
const searchSongs = (query) => {
    query = query.toLowerCase();
    for (let song in songs) {
        for (let i in songs[song].titles) {
            if (songs[song].titles[i].toLowerCase() === query) return [song,i]; //return the song if there is an exact match
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
    return new Promise( (resolve, reject) => {
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
    if (!(uniqueId in songs)) throw new Error("Song not found!");
    if (!isLangInRange(lang)) throw new Error("Lang out of range!");
    return songs[uniqueId].titles[lang];
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
    return lang >= 0 && lang <=1 ;
}

module.exports = { searchSongs, autocomplete, getSongName, isSongPresent, isLangInRange };
/**
 * data.js
 *
 * Helper functions involving parsing wordlist.json and musicinfo.json
 */
const wordlist = require('./data/datatable/wordlist.json');
const musicorder = require('./data/datatable/music_order.json');

const songs = {}; //uniqueId: {id, titles: [jp, en]}

/**
 * Gets song's uniqueId given Id
 * @param id
 * @returns {number|*}
 */
const getUniqueSongIdFromId = (id) => {
    for (let i in musicorder.items) {
        if (musicorder.items[i].id === id) return musicorder.items[i].uniqueId;
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
 *
 * @param query Query
 */
const searchSongs = (query) => {
    query = query.toLowerCase();
    let results = []; //return arr
    for (let song in songs) {
        for (let i in songs[song].titles) {
            if (songs[song].titles[i].toLowerCase() === query) return [song]; //return the song if there is an exact match
            if (songs[song].titles[i].toLowerCase().includes(query)) { //append the song for a partial match
                results.push(song);
                if (results.length >= 11) return results; //limit results to 11
            }
        }
    }
    return results;
}

/**
 * Gives autocomplete suggestions
 * @param query
 * @returns {string[]|*[]} [songTitle, "id|lang"]
 */
const autocomplete = (query) => {
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

const getSongName = (uniqueId, lang) => {
    if (!uniqueId in songs) throw new Error("Song not found!");
    if (lang < 0 || lang >= 2) throw new Error("Lang out of range!");
    return songs[uniqueId].titles[lang];
}

module.exports = { searchSongs, autocomplete, getSongName };
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
console.log(searchSongs("k"))
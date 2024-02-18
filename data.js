/**
 * data.js
 *
 * Helper functions involving parsing wordlist.json and musicinfo.json
 */
const wordlist = require('./data/datatable/wordlist.json');
const musicinfo = require('./data/datatable/musicinfo.json');
const eventfolderdata = require('./data/event_folder_data.json');
const songs = {}; //uniqueId: {id, titles: [jp, en]}


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
              musicinfo.items[i].genreNo
          ]
      }
  }
  return [-1,[0,0,0,0,0],-1]; //probably dumb
}

//create song object
for (let i in wordlist.items) {
  if (wordlist.items[i].key.startsWith('song') && !wordlist.items[i].key.startsWith('song_sub') && !wordlist.items[i].key.startsWith('song_detail')) {
      const id = wordlist.items[i].key.slice(5); //remove song_ from id
      const [uniqueId, difficulty, genreNo] = getMusicInfoFromId(id);
      if (uniqueId in songs) continue;
      songs[uniqueId] = {'id': id, titles : [wordlist.items[i].japaneseText, wordlist.items[i].englishUsText], 'difficulty' : difficulty, 'genreNo' : genreNo };
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

const getSongStars = (uniqueId, difficulty) => {
  if (!(uniqueId in songs)) throw new Error("Song not found!");
  return songs[uniqueId].difficulty[difficulty - 1];
}

const getEventSongs = (folderId) => {
  for (let i of eventfolderdata) {
    if (i.folderId == folderId) {
      return i.songNo;
    }
  }
  throw new Error("Folder not found!");
}

const getEventFromSong = (uniqueId) => {
  if (!(uniqueId in songs)) throw new Error("Song not found!");
  let folder = -1;
  for (let i in eventfolderdata) {
    if (isSongInEvent(uniqueId, eventfolderdata[i].folderId)) folder = eventfolderdata[i].folderId;
  }

  //Priority event folders
  if (isSongInEvent(uniqueId, 10)) folder = 10;
  else if (isSongInEvent(uniqueId, 8)) folder = 8;
  else if (isSongInEvent(uniqueId, 9)) folder = 9;
  else if (isSongInEvent(uniqueId, 3)) folder = 3;
  
  return folder;
}

const folderIdToName = (folderId, lang) => {
  if (!isEventFolderPresent) throw new Error("Event folder not found!");
  if (!isLangInRange(lang)) throw new Error("Lang out of range!");
  let folderName = '';
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

const isSongInEvent = (uniqueId, folderId) => {
  if (!(uniqueId in songs)) throw new Error("Song not found!");
  if (!isEventFolderPresent) throw new Error("Event folder not found!");
  let index = 0;
  for (let i in eventfolderdata) {
    if (eventfolderdata[i].folderId === folderId) index = i;
  }

  return eventfolderdata[index].songNo.includes(parseInt(uniqueId));
}

const isEventFolderPresent = (folderId) => {
  for (let i of eventfolderdata) {
    if (i.folderId === folderId) return true;
  }

  return false;
}
module.exports = { searchSongs, autocomplete, getSongName, isSongPresent, isLangInRange, getSongStars, getEventSongs, isSongInEvent, getEventFromSong, folderIdToName };
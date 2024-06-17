/**
 * bot.js
 *
 * Helper functions related to discord
 */
const data = require('@data');
const {
    failEmojiId,
    clearEmojiId,
    FCEmojiId,
    APEmojiId,
    easyEmojiId,
    normalEmojiId,
    hardEmojiId,
    oniEmojiId,
    uraEmojiId,
    rank0EmojiId,
    rank1EmojiId,
    rank2EmojiId,
    rank3EmojiId,
    rank4EmojiId,
    rank5EmojiId,
    rank6EmojiId,
    goodEmojiId,
    okEmojiId,
    bad1EmojiId,
    bad2EmojiId,
    dani1EmojiId,
    dani2EmojiId,
    dani3EmojiId,
    dani4EmojiId,
    dani5EmojiId,
    dani6EmojiId,
    token,
    guildId,
    serverBoostRoleId,
    adminRoleId
} = require('./config.json');
const taikodb = require('@taikodb');
const backup = require('./backup.js')
const {Client, GatewayIntentBits, Collection, Events} = require("discord.js");
const path = require("node:path");
const fs = require("node:fs");
const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent]});

const run = () => {
    client.commands = new Collection();
    const foldersPath = path.join(__dirname, 'commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }
    client.login(token);
}
client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    backup.backupAndUpload(client)
    setInterval(() => {
        backup.backupAndUpload(client);
    }, 1000 * 60 * 60);
});

client.on(Events.InteractionCreate, async interaction => {
    try {
        if (interaction.isChatInputCommand()) await handleChatInputCommand(interaction);
        if (interaction.isAutocomplete()) await handleAutocomplete(interaction);
    } catch (e) {
        console.log(e)
    }
});

const isBoostingServer = (userId) => {
    const guild = client.guilds.cache.get(guildId);
    const member = guild.members.cache.get(userId);
    if (member) {
        return member.roles.cache.has(serverBoostRoleId) || member.roles.cache.has(adminRoleId);
    }
    return false;
};

const handleChatInputCommand = async (interaction) => {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({content: 'There was an error while executing this command!', ephemeral: true});
        } else {
            await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
        }
    }
}
// this works but better solution found (didn't delete cuz might come in handy later)

// const receiveAccessCode = (user) => {
//     // Return a new Promise
//     return new Promise((resolve, reject) => {
//         if (!user || !user.createDM) {
//             reject(new Error('Invalid user object.'));
//         }
//         user.send("You have initiated a linking process. Respond to this message with your AccessCode within a minute.").catch(e => {
//             reject('Unable to send DM to user. Check your privacy settings')
//         })
//         // Create a DM channel with the user
//         user.createDM().then(dmChannel => {
//             // Set up a filter to ensure we only collect messages from this user
//             const filter = m => m.author.id === user.id;
//             // Create a message collector in the DM channel, collecting only 1 message with a 5-minute timeout
//             const collector = dmChannel.createMessageCollector({ filter, max: 1, time: 60000 });
//
//             collector.on('collect', m => {
//                 resolve(m.content);
//             });
//
//             collector.on('end', collected => {
//                 // If no messages were collected, reject the promise
//                 if (collected.size === 0) {
//                     reject(new Error('No messages were collected.'));
//                 }
//             });
//         }).catch(err => {
//             console.log(err);
//             reject('internal error.');
//         });
//     });
// }
const returnAutocomplete = async (interaction) => {
    const focusedValue = interaction.options.getFocused(); // Get query

    // Timeout promise
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve([]), 2500)); // 2.5 seconds

    // Autocomplete promise
    const autocompletePromise = data.autocomplete(focusedValue);

    // Race the autocomplete and timeout promises
    const filteredPromise = Promise.race([autocompletePromise, timeoutPromise]);

    filteredPromise.then(filtered => {
        // Send result back to Discord
        interaction.respond(
            filtered.map(choice => ({name: choice[0], value: choice[1]}))
        ).catch(error => {
            console.error('Error responding to interaction:', error);
        });
    }).catch(error => {
        console.error('Error in autocomplete or timeout:', error);
    });
}
const handleAutocomplete = async (interaction) => {
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }
    try {
        await command.autocomplete(interaction);
    } catch (error) {
        console.error(error);
    }
}

const replyWithErrorMessage = async (interaction, author, reason) => {
    const errorEmbed = {
        title: 'Error',
        description: reason,
        color: 13369344,
        author: {
            name: author
        }
    };
    await interaction.reply({embeds: [errorEmbed], ephemeral: true});
}

const editReplyWithErrorMessage = async (interaction, author, reason) => {
    const errorEmbed = {
        title: 'Error',
        description: reason,
        color: 13369344,
        author: {
            name: author
        }
    };
    await interaction.editReply({embeds: [errorEmbed], ephemeral: true});
}

const crownIdToEmoji = (crownId) => {
    switch (crownId) {
        case 1:
            return clearEmojiId;
        case 2:
            return FCEmojiId;
        case 3:
            return APEmojiId;
        default:
            return failEmojiId;
    }
}

const difficultyToEmoji = (difficultyId) => {
    switch (difficultyId) {
        case 1:
            return easyEmojiId;
        case 2:
            return normalEmojiId;
        case 3:
            return hardEmojiId;
        case 4:
            return oniEmojiId;
        case 5:
            return uraEmojiId;
        default:
            throw new Error('Unknown difficulty')
    }
}

const rankIdToEmoji = (rankId) => {
    switch (rankId) {
        case 0:
            return rank0EmojiId;
        case 1:
            return rank1EmojiId;
        case 2:
            return rank2EmojiId;
        case 3:
            return rank3EmojiId;
        case 4:
            return rank4EmojiId;
        case 5:
            return rank5EmojiId;
        case 6:
            return rank6EmojiId;
        default:
            return '';
    }
}

const daniClearStateToEmoji = (clearState) => {
    switch (clearState) {
        case 1:
            return dani1EmojiId;
        case 2:
            return dani2EmojiId;
        case 3:
            return dani3EmojiId;
        case 4:
            return dani4EmojiId;
        case 5:
            return dani5EmojiId;
        case 6:
            return dani6EmojiId;
        default:
            return '';
    }
}
const judgeIdToEmoji = (judgeId) => {
    switch (judgeId) {
        case 0:
            return goodEmojiId;
        case 1:
            return okEmojiId;
        case 2:
            return bad1EmojiId;
        case 3:
            return bad2EmojiId;
    }
}

const validateSong = async (interaction, songInput, commandName) => {
    let uniqueId, lang;
    if (songInput.includes('|')) { //search with autocomplete
        [uniqueId, lang] = songInput.split('|');
        if (!data.isLangInRange(lang)) {
            await replyWithErrorMessage(interaction, commandName, 'Bad input: invalid lang');
            return undefined;
        }
        if (!data.isSongPresent(uniqueId)) {
            await replyWithErrorMessage(interaction, commandName, 'Bad input: invalid song ID');
            return undefined;
        }
        await interaction.deferReply();
    } else { //search without autocomplete
        await interaction.deferReply();
        let searchResult = data.searchSongs(songInput);
        if (searchResult.length === 0) {
            await editReplyWithErrorMessage(interaction, commandName, `Song ${songInput} not found!`);
            return undefined;
        }
        [uniqueId, lang] = searchResult;
    }
    return [parseInt(uniqueId), parseInt(lang)]
}


//battle stuff

const ongoingBattles = new Set();
const playerFavouritedSongs = new Map();

module.exports = {
    replyWithErrorMessage,
    editReplyWithErrorMessage,
    handleChatInputCommand,
    handleAutocomplete,
    crownIdToEmoji,
    difficultyToEmoji,
    rankIdToEmoji,
    returnAutocomplete,
    judgeIdToEmoji,
    daniClearStateToEmoji,
    ongoingBattles,
    playerFavouritedSongs,
    validateSong,
    isBoostingServer,
    run
}
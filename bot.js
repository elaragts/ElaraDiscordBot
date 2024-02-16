/**
 * bot.js
 *
 * Helper functions related to discord
 */

const { failEmojiId, clearEmojiId, FCEmojiId, APEmojiId, easyEmojiId, normalEmojiId, hardEmojiId, oniEmojiId, uraEmojiId } = require('./config.json');
const data = require("./data");
const taikodb = require("./taikodb");


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
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
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
    interaction.reply({embeds: [errorEmbed], ephemeral: true});
}

const crownIdToEmoji = (crownId) => {
    switch (crownId) {
        case 1: return clearEmojiId;
        case 2: return FCEmojiId;
        case 3: return APEmojiId;
        default: return failEmojiId;
    }
}

const difficultyToEmoji = (difficultyId) => {
    switch (difficultyId) {
        case 1: return easyEmojiId;
        case 2: return normalEmojiId;
        case 3: return hardEmojiId;
        case 4: return oniEmojiId;
        case 5: return uraEmojiId;
        default: throw new Error('Unknown difficulty')
    }
}

module.exports = { replyWithErrorMessage, handleChatInputCommand, handleAutocomplete, crownIdToEmoji, difficultyToEmoji }
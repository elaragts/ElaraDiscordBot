/**
 * bot.js
 *
 * Helper functions related to discord
 */

const { failEmojiId, clearEmojiId, FCEmojiId, APEmojiId } = require('./config.json');

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

const crownIdToEmoji = (crownId) => {
    switch (crownId) {
        case 1: return clearEmojiId;
        case 2: return FCEmojiId;
        case 3: return APEmojiId;
        default: return failEmojiId;
    }
}

module.exports = { handleChatInputCommand, handleAutocomplete, crownIdToEmoji }
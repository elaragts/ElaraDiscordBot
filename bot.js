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
        case 1: return 'placeholder1';
        case 2: return 'placeholder2';
        case 3: return 'placeholder3';
        default: return 'placeholder0';
    }
}

module.exports = { handleChatInputCommand, handleAutocomplete, crownIdToEmoji }
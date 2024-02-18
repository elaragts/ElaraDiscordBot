const { SlashCommandBuilder } = require('discord.js');
const data = require('@data');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        let eventSongs = data.getEventSongs(1);
        let message = '';
        for (let i of eventSongs) {
          message += data.getSongName(i, 1) + '\n';
        }
        await interaction.reply(message);
    },
};
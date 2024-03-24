const { SlashCommandBuilder } = require('discord.js');
const botdb = require('@botdb');
const bot = require('@bot');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlink')
        .setDescription('Unlinks your discord account to an AccessCode')
        ,
    async execute(interaction) {
        const user = interaction.user;
        if (botdb.getBaidFromDiscordId(user.id) === undefined) {
            await bot.replyWithErrorMessage(interaction, 'link', 'Your account is not linked to a TPS profile yet')
            return;
        }
        botdb.unlinkDiscord(user.id);
        await interaction.reply({embeds: [{
                title: 'Successfully unlinked discord account',
                color: 13369344,
                author: {
                    name: 'Unlink'
                }
            }], ephemeral: true});
    },
};
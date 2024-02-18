const { SlashCommandBuilder } = require('discord.js');
const botdb = require('@botdb');
const taikodb = require('@taikodb');
const bot = require('@bot');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Links your discord account with a AccessCode')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('accessCode you use to login to TaikoWeb')
                .setRequired(true))
        ,
    async execute(interaction) {
        const user = interaction.user;
        const accessCode = interaction.options.getString('code');
        if (botdb.getAccessCodeFromDiscordId(user.id) !== undefined) {
            await bot.replyWithErrorMessage(interaction, 'link', 'Your account is already linked to an AccessCode (use !unlink to unlink your account)')
            return;
        }
        if (botdb.getDiscordIdFromAccessCode(accessCode) !== undefined) {
            await bot.replyWithErrorMessage(interaction, 'link', 'This AccessCode is already linked to another discord account');
            return;
        }
        if (taikodb.getBaidFromAccessCode(accessCode) === undefined) {
            await bot.replyWithErrorMessage(interaction, 'link', `AccessCode ${accessCode} doesn\'t exist!`);
            return;
        }
        botdb.linkDiscord(user.id, accessCode);
        await interaction.reply({embeds: [{
                title: 'Successfully linked discord account',
                color: 13369344,
                author: {
                    name: 'Link'
                }
            }], ephemeral: true});
    },
};
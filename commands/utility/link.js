const { SlashCommandBuilder } = require('discord.js');
const botdb = require('@botdb');
const taikodb = require('@taikodb');
const bot = require('@bot');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Links your discord account to an AccessCode')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('accessCode you use to login to TaikoWeb')
                .setRequired(true))
        ,
    async execute(interaction) {
        const user = interaction.user;
        if (botdb.getBaidFromDiscordId(user.id) !== undefined) {
            await bot.replyWithErrorMessage(interaction, 'link', 'Your account is already linked to an AccessCode (use /unlink to unlink your account)')
            return;
        }
        const accessCode = interaction.options.getString('code');
        const baid = taikodb.getBaidFromAccessCode(accessCode)
        if (baid === undefined) {
            await bot.replyWithErrorMessage(interaction, 'link', `AccessCode ${accessCode} doesn\'t exist!`);
            return;
        }
        if (botdb.getDiscordIdFromBaid(baid) !== undefined) {
            await bot.replyWithErrorMessage(interaction, 'link', 'This Taiko profile is already linked to another discord account');
            return;
        }
        botdb.linkDiscord(user.id, baid);
        await interaction.reply({embeds: [{
                title: 'Successfully linked discord account',
                color: 13369344,
                author: {
                    name: 'Link'
                }
            }], ephemeral: true});
    },
};
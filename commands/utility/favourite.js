const {SlashCommandBuilder} = require('discord.js');
const taikodb = require('@taikodb');
const bot = require('@bot');
const botdb = require('@botdb')
const data = require('@data')
const autocomplete = bot.returnAutocomplete;
module.exports = {
    data: new SlashCommandBuilder()
        .setName('favourite')
        .setDescription('Add/Remove Songs to Favourite Songs')
        .addStringOption(option =>
            option.setName('song')
                .setDescription('Song name')
                .setRequired(true)
                .setAutocomplete(true))
    ,
    //handle autocomplete interaction
    autocomplete
    ,
    async execute(interaction) {
        const baid = botdb.getBaidFromDiscordId(interaction.user.id);
        if (baid === undefined) {
            await bot.replyWithErrorMessage(interaction, 'Best Score', 'You have not linked your discord account to your card yet!');
            return;
        }
        const songValidationResult = await bot.validateSong(interaction, interaction.options.getString('song'), "Favourite");
        if (songValidationResult === undefined) return;
        const [uniqueId, lang] = songValidationResult;
        let favouriteSongs = JSON.parse(taikodb.getFavouriteSongsArray(baid));
        const index = favouriteSongs.indexOf(uniqueId);
        let message;
        if (index > -1) {
            favouriteSongs.splice(index, 1);
            message = `Successfully Removed \`${data.getSongName(uniqueId, lang)}\``
        } else {
            favouriteSongs.push(uniqueId);
            message = `Successfully Added \`${data.getSongName(uniqueId, lang)}\``
        }
        taikodb.setFavouriteSongsArray(baid, JSON.stringify(favouriteSongs));
        const returnEmbed = {
            description: message,
            color: 15410003,
            author: {
                name: "Favourite"
            },
        };
        await interaction.editReply({embeds: [returnEmbed]});
    }
};
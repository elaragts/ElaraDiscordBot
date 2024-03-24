const { SlashCommandBuilder } = require('discord.js');
const data = require('@data');
const taikodb = require('@taikodb');
const botdb = require('@botdb');
const bot = require('@bot');
const autocomplete = bot.returnAutocomplete;
module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Song leaderboard')
        .addStringOption(option =>
            option.setName('song')
                .setDescription('Song name')
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option =>
            option.setName('difficulty')
                .setDescription('Difficulty of the map')
                .setRequired(true)
                .addChoices(
                    { name: 'かんたん/Easy', value: '1' },
                    { name: 'ふつう/Normal', value: '2' },
                    { name: 'むずかしい/Hard', value: '3' },
                    { name: 'おに/Oni', value: '4' },
                    { name: 'おに (裏)/Ura Oni', value: '5' }
                )
        )
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('Leaderboard Page')
                .setRequired(false)
                .setMinValue(1)
        )
    ,
    //handle autocomplete interaction
    autocomplete,
    async execute(interaction) {
        const songInput = interaction.options.getString('song');
        const difficulty = parseInt(interaction.options.getString('difficulty'));
        const page = interaction.options.getInteger('page') || 1;
        //error checking
        let uniqueId, lang;
        if (songInput.includes('|')) { //search with autocomplete
            [uniqueId, lang] = songInput.split('|');
            lang = parseInt(lang);
            if (!data.isLangInRange(lang)) {
                await bot.replyWithErrorMessage(interaction, 'leaderboard', 'Bad input: invalid lang');
                return;
            }
            if (!data.isSongPresent(uniqueId)) {
                await bot.replyWithErrorMessage(interaction, 'leaderboard', 'Bad input: invalid song ID');
                return;
            }
            await interaction.deferReply();
        } else { //search without autocomplete
            await interaction.deferReply();
            let searchResult = data.searchSongs(songInput);
            if (searchResult.length === 0) {
                bot.editReplyWithErrorMessage(interaction, 'leaderboard', `Song ${songInput} not found!`);
                return;
            }
            [uniqueId, lang] = searchResult;
            lang = parseInt(lang);
        }

        //error checking done
        const res = taikodb.getLeaderboard(uniqueId, difficulty, (page-1)*10); //taiko DB query result
        let desc = '';

        //iterate over taiko DB return value and create text for the embed ({i}. {player}: :crown:{score})
        for (let i in res) {
            const crown = bot.crownIdToEmoji(res[i].BestCrown);
            const rank = bot.rankIdToEmoji(res[i].BestScoreRank - 2);
            let name;
            let discordId = botdb.getDiscordIdFromBaid(res[i].Baid);
            if (discordId === undefined) name = res[i].MyDonName;
            else name = `<@${discordId}>`;
            desc += `${(page-1)*10+parseInt(i)+1}. ${name}: ${crown}${rank}${res[i].BestScore}\n`
        }
        //no results
        if (res.length === 0) {
            if (data.getSongStars(uniqueId, difficulty) === 0) {
                desc = 'This difficulty does not exist.';
            } else {
                desc = 'No best score data';
            }
        }

        //construct embed
        const returnEmbed = {
            title: `${data.getSongName(uniqueId, lang)} | ${taikodb.difficultyIdToName(difficulty, lang)}${bot.difficultyToEmoji(difficulty)}★${data.getSongStars(uniqueId, difficulty)}`,
            description: desc,
            color: 15410003,
            author: {
                name: "Leaderboard"
            },
            timestamp: new Date().toISOString()
        };
        await interaction.editReply({ embeds: [returnEmbed] });
    },
};
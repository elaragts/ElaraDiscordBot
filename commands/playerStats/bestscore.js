const { SlashCommandBuilder } = require('discord.js');
const data = require('@data');
const taikodb = require('@taikodb');
const bot = require('@bot');
const botdb = require('@botdb');
const autocomplete = bot.returnAutocomplete;
module.exports = {
    data: new SlashCommandBuilder()
        .setName('bestscore')
        .setDescription('Best Score')
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
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to obtain the score from')
                .setRequired(false)
        )
    ,
    //handle autocomplete interaction
    autocomplete,
    async execute(interaction) {
        const songInput = interaction.options.getString('song');
        const difficulty = parseInt(interaction.options.getString('difficulty'));
        let user;
        if (interaction.options.getUser('user')) {
            user = interaction.options.getUser('user');
            if (botdb.getAccessCodeFromDiscordId(user.id) === undefined) {
                await bot.replyWithErrorMessage(interaction, 'Best Score', 'This user has not linked their discord account to their card yet!');
                return;
            }
        } else {
            user = interaction.user;
            if (botdb.getAccessCodeFromDiscordId(user.id) === undefined) {
                await bot.replyWithErrorMessage(interaction, 'Best Score', 'You have not linked your discord account to your card yet!');
                return;
            }
        }
        const baid = taikodb.getBaidFromAccessCode(botdb.getAccessCodeFromDiscordId(user.id));
        //error checking
        let uniqueId, lang;
        if (songInput.includes('|')) { //search with autocomplete
            [uniqueId, lang] = songInput.split('|');
            lang = parseInt(lang);
            if (!data.isLangInRange(lang)) {
                await bot.replyWithErrorMessage(interaction, 'Best Score', 'Bad input: invalid lang');
                return;
            }
            if (!data.isSongPresent(uniqueId)) {
                await bot.replyWithErrorMessage(interaction, 'Best Score', 'Bad input: invalid song ID');
                return;
            }
            await interaction.deferReply();
        } else { //search without autocomplete
            await interaction.deferReply();
            let searchResult = data.searchSongs(songInput);
            if (searchResult.length === 0) {
                bot.EditReplyWithErrorMessage(`Song ${songInput} not found!`);
                return;
            }
            [uniqueId, lang] = searchResult;
            lang = parseInt(lang);
        }
        const song = taikodb.getBestScore(uniqueId, difficulty, baid);
        if (song === undefined) {
            const returnEmbed = {
                title: `${user.username} | ${data.getSongName(uniqueId, lang)} | ${taikodb.difficultyIdToName(difficulty, lang)}${bot.difficultyToEmoji(difficulty)}★${data.getSongStars(uniqueId, difficulty)}`,
                description: 'No play data available for this song.',
                color: 15410003,
                author: {
                    name: "Best Score"
                },
                timestamp: new Date().toISOString()
            };
            await interaction.editReply({ embeds: [returnEmbed] });
            return;
        }

        //error checking done
        const crown = bot.crownIdToEmoji(song.Crown);
        const rank = bot.rankIdToEmoji(song.ScoreRank - 2);
        desc = `${crown}${rank}`;

        let judgement = '';
        judgement += `${bot.judgeIdToEmoji(0)}${song.GoodCount}\n`;
        judgement += `${bot.judgeIdToEmoji(1)}${song.OkCount}\n`;
        judgement += `${bot.judgeIdToEmoji(2)}${bot.judgeIdToEmoji(3)}${song.MissCount}`;
        pointsLabel = '点';
        if (lang === 1) pointsLabel = ' points'

        //no results
        if (data.getSongStars(uniqueId, difficulty) === 0) {
            desc = 'This difficulty does not exist.';
        }
        //construct embed
        const returnEmbed = {
            title: `${user.username} | ${data.getSongName(uniqueId, lang)} | ${taikodb.difficultyIdToName(difficulty, lang)}${bot.difficultyToEmoji(difficulty)}★${data.getSongStars(uniqueId, difficulty)}`,
            color: 15410003,
            description: `## ${desc}${song.Score}${pointsLabel}`,
            author: {
                name: `Best Score`
            },
            timestamp: song.PlayTime,
            fields: [
                // {
                //     name: 'Score',
                //     value: song.Score,
                //     inline: true
                // },
                {
                    name: 'Judgement',
                    value: judgement,
                    inline: true
                },
                {
                    name: '',
                    value: `**Max Combo:** ${song.ComboCount}\n**Drumroll Count:** ${song.DrumrollCount}`,
                    inline: true
                }
                // {
                //     name: 'Drumroll Count',
                //     value: song.DrumrollCount
                // }
            ]
        };
        await interaction.editReply({ embeds: [returnEmbed] });
    },
};
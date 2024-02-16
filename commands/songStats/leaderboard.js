const { SlashCommandBuilder } = require('discord.js');
const data = require('../../data.js');
const taikodb = require('../../taikodb.js'); //TODO: remove this relative path shit
const bot = require('../../bot.js');
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
                    { name: 'おに/Oni', value: '4'},
                    { name: 'おに (裏) / Ura Oni', value: '5'}
                )
)
    ,
    //handle autocomplete interaction
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused(); // Get query

        // Timeout promise
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({}), 2500)); // 2.5 seconds

        // Autocomplete promise
        const autocompletePromise = data.autocomplete(focusedValue);

        // Race the autocomplete and timeout promises
        const filteredPromise = Promise.race([autocompletePromise, timeoutPromise]);

        filteredPromise.then(filtered => {
            // Send result back to Discord
            interaction.respond(
                filtered.map(choice => ({ name: choice[0], value: choice[1] }))
            ).catch(error => {
                console.error('Error responding to interaction:', error);
            });
        }).catch(error => {
            console.error('Error in autocomplete or timeout:', error);
        });
    },
    async execute(interaction) {
        const songInput = interaction.options.getString('song');
        const difficulty = parseInt(interaction.options.getString('difficulty'));
        //error checking
        if (!songInput.includes('|')) {
            await bot.replyWithErrorMessage(interaction, 'leaderboard', 'Bad input: missing pipe');
            return;
        }
        let [uniqueId, lang] = songInput.split('|');
        lang = parseInt(lang);
        if (!data.isLangInRange(lang)) {
            await bot.replyWithErrorMessage(interaction, 'leaderboard', 'Bad input: invalid lang');
            return;
        }
        if (!data.isSongPresent(uniqueId)) {
            await bot.replyWithErrorMessage(interaction, 'leaderboard', 'Bad input: invalid song');
            return;
        }
        //error checking done
        const res = taikodb.getLeaderboard(uniqueId, difficulty); //taiko DB query result
        let desc = '';
        //iterate over taiko DB return value and create text for the embed ({i}. {player}: :crown:{score})
        for (let i in res) {
            const crown = bot.crownIdToEmoji(res[i].BestCrown)
            desc += `${i}. ${res[i].MyDonName}: ${crown}${res[i].BestScore}\n`
        }
        //no results
        if (res.length === 0) desc = 'No best score data (only clears are shown)';

        //construct embed
        const returnEmbed = {
                title: `${data.getSongName(uniqueId, lang)} | ${taikodb.difficultyIdToName(difficulty, lang)}${bot.difficultyToEmoji(difficulty)}`,
                description: desc ,
                color: 15410003,
                author: {
                    name: "Leaderboard"
                },
                timestamp: new Date().toISOString()
            };
        interaction.reply({ embeds: [returnEmbed] });
    },
};
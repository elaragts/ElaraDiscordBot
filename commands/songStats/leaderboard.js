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
        const focusedValue = interaction.options.getFocused(); //get query
        const filtered = data.autocomplete(focusedValue); //get results TODO: set timer
        await interaction.respond( //send result back to discord
            filtered.map(choice => ({ name: choice[0], value: choice[1] })),
        );
    },
    async execute(interaction) {
        const songInput = interaction.options.getString('song');
        const difficulty = interaction.options.getString('difficulty');
        if (!songInput.includes('|')) interaction.reply('Bad'); //TODO: Change this to standard error msg
        const [uniqueId, lang] = songInput.split('|');
        const res = taikodb.getLeaderboard(uniqueId, difficulty); //taiko DB query result
        let string = `${data.getSongName(uniqueId, lang)} ${difficulty}\n`;
        for (let i in res) {
            const crown = bot.crownIdToEmoji(res[i].BestCrown)
            string += `${res[i].MyDonName}: ${crown}${res[i].BestScore}\n`
        }
        interaction.reply(string);
    },
};
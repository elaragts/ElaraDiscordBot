const {SlashCommandBuilder} = require('discord.js');
const bot = require('@bot');
const data = require('@data')
const autocomplete = bot.returnAutocomplete;
module.exports = {
    data: new SlashCommandBuilder()
        .setName('uid')
        .setDescription('Get Song Id/Song from Id')
        .addStringOption(option =>
            option.setName('song')
                .setDescription('Song name')
                .setRequired(false)
                .setAutocomplete(true))
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('Song UniqueId')
                .setRequired(false)
                .setMinValue(0)
        )
    ,
    //handle autocomplete interaction
    autocomplete
    ,
    async execute(interaction) {
        const songInput = interaction.options.getString('song');
        const idInput = interaction.options.getInteger('id');
        let uniqueId;
        let lang = 0;
        if (songInput !== null) {
            const songValidationResult = await bot.validateSong(interaction, songInput, "Uid");
            if (songValidationResult === undefined) return;
            [uniqueId, lang] = songValidationResult;
        } else if (idInput !== null) {
            uniqueId = idInput;
            try {
                data.checkUniqueId(uniqueId, 'uid');
            } catch (e) {
                await bot.replyWithErrorMessage(interaction, 'uid', `uid \`${uniqueId}\` は存在しません`);
                return;
            }
            await interaction.deferReply();
        } else {
            await bot.replyWithErrorMessage(interaction, 'uid', '曲名かUIDを入力してください');
            return;
        }
        const returnEmbed = {
            description: `\`${data.getSongName(uniqueId,lang)}\` Unique ID: \`${uniqueId}\``,
            color: 15410003,
            author: {
                name: "uid"
            },
        };
        await interaction.editReply({embeds: [returnEmbed], ephemeral: true});
    }
};
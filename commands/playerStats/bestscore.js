const {SlashCommandBuilder, AttachmentBuilder} = require('discord.js');
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
                    {name: 'かんたん/Easy', value: '1'},
                    {name: 'ふつう/Normal', value: '2'},
                    {name: 'むずかしい/Hard', value: '3'},
                    {name: 'おに/Oni', value: '4'},
                    {name: 'おに (裏)/Ura Oni', value: '5'}
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
        let baid;
        let user;
        if (interaction.options.getUser('user')) {
            user = interaction.options.getUser('user')
            baid = botdb.getBaidFromDiscordId(user.id);
            if (baid === undefined) {
                await bot.replyWithErrorMessage(interaction, 'Best Score', 'This user has not linked their discord account to their card yet!');
                return;
            }
        } else {
            user = interaction.user;
            baid = botdb.getBaidFromDiscordId(interaction.user.id);
            if (baid === undefined) {
                await bot.replyWithErrorMessage(interaction, 'Best Score', 'You have not linked your discord account to your card yet!');
                return;
            }
        }
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
                await bot.editReplyWithErrorMessage(interaction, 'Best Score', `Song ${songInput} not found!`);
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
            await interaction.editReply({embeds: [returnEmbed]});
            return;
        }

        //error checking done
        const rank = bot.rankIdToEmoji(song.ScoreRank - 2);
        const crown = bot.crownIdToEmoji(song.crown);
        desc = `${crown}${rank}`;
        let judgement = '';
        judgement += `${bot.judgeIdToEmoji(0)}${song.GoodCount}\n`;
        judgement += `${bot.judgeIdToEmoji(1)}${song.OkCount}\n`;
        judgement += `${bot.judgeIdToEmoji(2)}${bot.judgeIdToEmoji(3)}${song.MissCount}`;
        let pointsLabel = '点';
        let judgementLabel = '判定';
        let comboLabel = '最大コンボ数';
        let rendaLabel = '連打数';
        let playCountLabel = 'プレイ回数';
        let clearCountLabel = 'ノルマクリア回数';
        let fullComboLabel = 'フルコンボ回数';
        let zenryouLabel = '全良回数';
        if (lang === 1) {
            pointsLabel = ' points';
            judgementLabel = 'judgement';
            comboLabel = 'Max Combo';
            rendaLabel = 'Drumroll'
            playCountLabel = 'Play Count'
            clearCountLabel = 'Clear Count'
            fullComboLabel = 'Full Combo Count';
            zenryouLabel = 'Donderful Combo Count';
        }

        //no results
        if (data.getSongStars(uniqueId, difficulty) === 0) {
            desc = 'This difficulty does not exist.';
        }
        //construct avatar
        const avatar = await taikodb.getCostume(baid);
        const attachment = new AttachmentBuilder(avatar, {name: 'avatar.png'});
        //construct embed
        const returnEmbed = {
            title: `${song.MyDonName} | ${data.getSongName(uniqueId, lang)} | ${taikodb.difficultyIdToName(difficulty, lang)}${bot.difficultyToEmoji(difficulty)}★${data.getSongStars(uniqueId, difficulty)}`,
            color: 15410003,
            description: `## ${desc}${song.Score}${pointsLabel}\n${playCountLabel}: ${song.playCount}\n${clearCountLabel}: ${song.clearCount}\n${fullComboLabel}: ${song.fullComboCount}\n${zenryouLabel}: ${song.zenryouCount}`,
            author: {
                name: `Best Score`
            },
            thumbnail: {
                url: `attachment://avatar.png`
            },
            timestamp: song.PlayTime,
            fields: [
                {
                    name: judgementLabel,
                    value: judgement,
                    inline: true
                },
                {
                    name: '',
                    value: `**${comboLabel}:** ${song.ComboCount}\n**${rendaLabel}:** ${song.DrumrollCount}`,
                    inline: true
                }
            ]
        };
        await interaction.editReply({embeds: [returnEmbed], files: [attachment]});
    },
};
const {SlashCommandBuilder, AttachmentBuilder} = require('discord.js');
const taikodb = require('@taikodb');
const bot = require('@bot');
const botdb = require('@botdb');
const data = require('@data');
const costume = require('@costume')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('User profile')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to obtain the score from')
                .setRequired(false)
        )
    ,
    async execute(interaction) {
        let user;
        if (interaction.options.getUser('user')) {
            user = interaction.options.getUser('user');
            if (botdb.getAccessCodeFromDiscordId(user.id) === undefined) {
                await bot.replyWithErrorMessage(interaction, 'Profile', 'This user has not linked their discord account to their card yet!');
                return;
            }
        } else {
            user = interaction.user;
            if (botdb.getAccessCodeFromDiscordId(user.id) === undefined) {
                await bot.replyWithErrorMessage(interaction, 'Profile', 'You have not linked your discord account to your card yet!');
                return;
            }
        }
        await interaction.deferReply();
        const baid = taikodb.getBaidFromAccessCode(botdb.getAccessCodeFromDiscordId(user.id));
        const profile = await taikodb.getPlayerProfile(baid);
        const clearState = bot.daniClearStateToEmoji(profile.ClearState);
        const dani = data.danIdToName(profile.DanId)
        let achievementPanelEmoji = '';
        let achievementPanel = '';
        let achievementPanelTitle = '';
        if (profile.AchievementDisplayDifficulty !== 0 && profile.bestcrown_1 !== null) {
            achievementPanelEmoji = bot.difficultyToEmoji(profile.AchievementDisplayDifficulty);
            if (profile.AchievementDisplayDifficulty === 5) {
                achievementPanelEmoji = bot.difficultyToEmoji(4) + bot.difficultyToEmoji(5);
            }
            achievementPanelTitle = `Achievement Panel ${achievementPanelEmoji}`;
            let rankEmojis = []
            for (let i = 0; i <= 6; i++) {
                rankEmojis.push(bot.rankIdToEmoji(i));
            }
            const rankAndCrownValues = {
                'rank0': profile.bestscorerank_2,
                'rank1': profile.bestscorerank_3,
                'rank2': profile.bestscorerank_4,
                'rank3': profile.bestscorerank_5,
                'rank4': profile.bestscorerank_6,
                'rank5': profile.bestscorerank_7,
                'rank6': profile.bestscorerank_8,
                'crown1': profile.bestcrown_1,
                'crown2': profile.bestcrown_2,
                'crown3': profile.bestcrown_3,
            }
            const padString = (string, length) => {
                return string + '\u00A0'.repeat((length - string.toString().length) * 2);
            }
            const maxLength = Math.max(
                ...Object.values(rankAndCrownValues).map(val => val.toString().length)
            );

            achievementPanel = `
  ${rankEmojis[6]} ${padString(rankAndCrownValues['rank6'], maxLength)}
  ${rankEmojis[3]} ${padString(rankAndCrownValues['rank3'], maxLength)} ${rankEmojis[4]} ${padString(rankAndCrownValues['rank4'], maxLength)} ${rankEmojis[5]} ${padString(rankAndCrownValues['rank5'], maxLength)}
  ${rankEmojis[0]} ${padString(rankAndCrownValues['rank0'], maxLength)} ${rankEmojis[1]} ${padString(rankAndCrownValues['rank1'], maxLength)} ${rankEmojis[2]} ${padString(rankAndCrownValues['rank2'], maxLength)}
  ${bot.crownIdToEmoji(3)} ${padString(rankAndCrownValues['crown3'], maxLength)} ${bot.crownIdToEmoji(2)} ${padString(rankAndCrownValues['crown2'], maxLength)} ${bot.crownIdToEmoji(1)} ${padString(rankAndCrownValues['crown1'], maxLength)}
`;
        }
        const avatar = await costume.createCostumeAvatar(JSON.parse(profile.CostumeData), parseInt(profile.ColorBody), parseInt(profile.ColorFace))
        const attachment = new AttachmentBuilder(avatar, {name: 'avatar.png'});

        //construct embed
        const returnEmbed = {
            title: `${clearState}${dani} ${profile.DanId ? '|' : ''} ${profile.MyDonName}`,
            color: 15410003,
            description: `Title: ${profile.Title}\nPlay Count: ${profile.PlayCount}`,
            thumbnail: {
                url: 'attachment://avatar.png',
            }, author: {
                name: `Profile`
            },
            fields: [
                {
                    name: achievementPanelTitle,
                    value: achievementPanel,
                },
            ],
        };
        await interaction.editReply({embeds: [returnEmbed], files: [attachment]});
    },
};
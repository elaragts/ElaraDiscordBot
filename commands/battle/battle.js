const {SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const data = require('@data');
const taikodb = require('@taikodb');
const bot = require('@bot');
const botdb = require('@botdb');
const {getSongName} = require("../../data");
const autocomplete = bot.returnAutocomplete;
module.exports = {
    data: new SlashCommandBuilder()
        .setName('battle')
        .setDescription('Battle against another user')
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
    ,
    //handle autocomplete interaction
    autocomplete,
    async execute(interaction) {
        const userOne = interaction.user;
        if (bot.ongoingBattles.has(userOne.id)) {
            await bot.replyWithErrorMessage(interaction, 'Battle', 'You already started a battle');
            return;
        }
        //buttons
        const join = new ButtonBuilder()
            .setCustomId('join')
            .setLabel('Join Battle')
            .setStyle(ButtonStyle.Primary);

        const cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel Battle')
            .setStyle(ButtonStyle.Danger);

        const joinRow = new ActionRowBuilder()
            .addComponents(join, cancel);

        //execute
        const songInput = interaction.options.getString('song');
        const difficulty = parseInt(interaction.options.getString('difficulty'));
        const baid = botdb.getBaidFromDiscordId(interaction.user.id);
        const winCondition = "Score"
        if (baid === undefined) {
            await bot.replyWithErrorMessage(interaction, 'Battle', 'You have not linked your discord account to your card yet!');
            return;
        }
        //error checking
        let songId, lang;
        if (songInput.includes('|')) { //search with autocomplete
            [songId, lang] = songInput.split('|');
            lang = parseInt(lang);
            if (!data.isLangInRange(lang)) {
                await bot.replyWithErrorMessage(interaction, 'Battle', 'Bad input: invalid lang');
                return;
            }
            if (!data.isSongPresent(songId)) {
                await bot.replyWithErrorMessage(interaction, 'Battle', 'Bad input: invalid song ID');
                return;
            }
        } else { //search without autocomplete
            let searchResult = data.searchSongs(songInput);
            if (searchResult.length === 0) {
                await bot.replyWithErrorMessage(interaction, 'Battle', `Song ${songInput} not found!`);
                return;
            }
            [songId, lang] = searchResult;
            lang = parseInt(lang);
        }
        bot.ongoingBattles.add(userOne.id);
        const songName = getSongName(songId, lang);
        const returnEmbed = {
            title: `${interaction.user.username} VS. TBD`,
            color: 15410003,
            author: {
                name: 'Battle'
            },
            description: `## ${songName} ${bot.difficultyToEmoji(difficulty)}`,
        };
        const joinResponse = await interaction.reply({
            embeds: [returnEmbed],
            components: [joinRow],
        });

        const joinCollector = joinResponse.createMessageComponentCollector({filter: i => true, time: 60000}); // i => true (I am 7 picoseconds away from shooting myself)

        joinCollector.on('collect', async i => {
            if (i.customId === 'cancel' && i.user.id === interaction.user.id) {
                await interaction.editReply({
                    embeds: [{
                        title: `${interaction.user.username} VS. TBD`,
                        color: 15410003,
                        author: {
                            name: 'Battle'
                        },
                        description: `Battle Cancelled`,
                    }], components: []
                });
                bot.ongoingBattles.delete(userOne.id);
                joinCollector.stop('battle_canceled');
            } else if (i.customId === 'join') {
                if (i.user.id === interaction.user.id) {
                    await i.reply({content: "You can't join your own battle!", ephemeral: true});
                    return;
                }
                if (bot.ongoingBattles.has(i.user.id)) {
                    await i.reply({content: "You are already in a battle!", ephemeral: true});
                    return;
                }
                if (botdb.getBaidFromDiscordId(i.user.id) === undefined) {
                    await i.reply({content: "You haven't linked your account yet", ephemeral: true});
                    return;
                }
                joinCollector.stop('battle_joined');
                await startBattle(i, userOne, i.user);
            }
        });

        joinCollector.on('end', async (collected, reason) => {
            if (reason === 'time') {
                bot.ongoingBattles.delete(userOne.id);
                await interaction.editReply({
                    embeds: [{
                        title: `${interaction.user.username} VS. TBD`,
                        color: 15410003,
                        author: {
                            name: 'Battle'
                        },
                        description: `Battle Cancelled (No one joined)`,
                    }], components: []
                });
            }
        });
        const startBattle = async (i, userOne, userTwo) => {
            try {
                await interaction.user.send("Battle started!");
            } catch (e) {
                await interaction.channel.send(`<@${userOne.id}> Battle started!`)
            }
            const minSongPlayId = taikodb.getMaxSongPlayId(); //minimum id of submission must be greater than current Max Song Play ID
            const baidOne = botdb.getBaidFromDiscordId(userOne.id);
            const baidTwo = botdb.getBaidFromDiscordId(userTwo.id);
            bot.playerFavouritedSongs.set(baidOne, await taikodb.getFavouriteSongsArray(baidOne));
            bot.playerFavouritedSongs.set(baidTwo, await taikodb.getFavouriteSongsArray(baidTwo));
            await taikodb.setFavouriteSongsArray(baidOne, `[${songId}]`);
            await taikodb.setFavouriteSongsArray(baidTwo, `[${songId}]`);
            let userOnePlay;
            let userTwoPlay;
            const submit = new ButtonBuilder()
                .setCustomId('submit')
                .setLabel('Submit Score')
                .setStyle(ButtonStyle.Success);

            const submitRow = new ActionRowBuilder()
                .addComponents(submit);
            bot.ongoingBattles.add(userTwo.id);

            await i.update({
                embeds: [{
                    title: `${userOne.username} VS. ${userTwo.username}`,
                    color: 15410003,
                    author: {
                        name: 'Battle'
                    },
                    description: `## ${songName} ${bot.difficultyToEmoji(difficulty)}\n### Instructions:\n1. set number of games to \`1\` in the service menu\n2. go to Liked Songs and find \`${songName}\`\n3. press submit button once you finish playing (and go back to attract screen)`,
                }], components: [submitRow]
            });

            const submissionCollector = joinResponse.createMessageComponentCollector({
                filter: x => [userOne.id, userTwo.id].includes(x.user.id),
                time: 300000
            });

            submissionCollector.on('collect', async i => {
                if (i.customId !== 'submit') return;
                const baid = botdb.getBaidFromDiscordId(i.user.id);
                const songPlay = taikodb.getLatestSongPlayFromBaid(baid, songId, difficulty);
                if (songPlay === undefined || songPlay.Id <= minSongPlayId) {
                    await i.reply({content: "No score submitted", ephemeral: true});
                    return;
                }
                if (i.user.id === userOne.id) {
                    userOnePlay = songPlay;
                } else {
                    userTwoPlay = songPlay;
                }
                await updateBattleEmbed(i);
                if (userOnePlay !== undefined && userTwoPlay !== undefined) {
                    submissionCollector.stop('battle_finished');
                }
            });

            submissionCollector.on('end', async (collected, reason) => {
                await taikodb.setFavouriteSongsArray(baidOne, bot.playerFavouritedSongs.get(baidOne));
                await taikodb.setFavouriteSongsArray(baidTwo, bot.playerFavouritedSongs.get(baidTwo));
                bot.playerFavouritedSongs.delete(baidOne);
                bot.playerFavouritedSongs.delete(baidTwo);
                bot.ongoingBattles.delete(userOne.id)
                bot.ongoingBattles.delete(userTwo.id)
                if (reason === 'time') {
                    bot.ongoingBattles.delete(userOne.id);
                    await interaction.editReply({
                        embeds: [{
                            title: `${interaction.user.username} VS. TBD`,
                            color: 15410003,
                            author: {
                                name: 'Battle'
                            },
                            description: `Battle Ended, Someone didn't submit a score in time`,
                        }], components: []
                    });
                    return;
                }
                //battle finished
                let winner;
                if (userOnePlay[winCondition] > userTwoPlay[winCondition]) {
                    winner = userOne.id;
                } else if (userOnePlay[winCondition] < userTwoPlay[winCondition]) {
                    winner = userTwo.id;
                } else {
                    winner = null;
                }
                botdb.addBattle(songId, userOne.id, userTwo.id, winner);
            });

            const updateBattleEmbed = async (i) => {
                const userOnePlayStr = userOnePlay === undefined ? 'No score submitted' :
                    `${bot.crownIdToEmoji(userOnePlay.crown)}${bot.rankIdToEmoji(userOnePlay.ScoreRank - 2)} ${userOnePlay.Score}
                    ${bot.judgeIdToEmoji(0)}${userOnePlay.GoodCount}
                    ${bot.judgeIdToEmoji(1)}${userOnePlay.OkCount}
                    ${bot.judgeIdToEmoji(2)}${bot.judgeIdToEmoji(3)}${userOnePlay.MissCount}
                    **Max Combo:** ${userOnePlay.ComboCount}
                    **Max Drumroll:** ${userOnePlay.DrumrollCount}
                    `;
                const userTwoPlayStr = userTwoPlay === undefined ? 'No score submitted' :
                    `${bot.crownIdToEmoji(userTwoPlay.crown)}${bot.rankIdToEmoji(userTwoPlay.ScoreRank - 2)} ${userTwoPlay.Score}
                    ${bot.judgeIdToEmoji(0)}${userTwoPlay.GoodCount}
                    ${bot.judgeIdToEmoji(1)}${userTwoPlay.OkCount}
                    ${bot.judgeIdToEmoji(2)}${bot.judgeIdToEmoji(3)}${userTwoPlay.MissCount}
                    **Max Combo:** ${userTwoPlay.ComboCount}
                    **Max Drumroll:** ${userTwoPlay.DrumrollCount}
                    `;
                let description = `## ${songName} ${bot.difficultyToEmoji(difficulty)}\n### Match Ongoing`
                let components = [submitRow];
                if (userOnePlay !== undefined && userTwoPlay !== undefined) { //checking win condition twice is cringe but idrc
                    components = [];
                    if (userOnePlay[winCondition] > userTwoPlay[winCondition]) {
                        description = `## ${songName} ${bot.difficultyToEmoji(difficulty)}\n### ${userOne.username} wins!`
                    } else if (userOnePlay[winCondition] < userTwoPlay[winCondition]) {
                        description = `## ${songName} ${bot.difficultyToEmoji(difficulty)}\n### ${userTwo.username} wins!`
                    } else {
                        description = `## ${songName} ${bot.difficultyToEmoji(difficulty)}\n### Draw!`
                    }
                }
                await i.update({
                    embeds: [{
                        title: `${userOne.username} VS. ${userTwo.username}`,
                        color: 15410003,
                        author: {
                            name: 'Battle'
                        },
                        description: description,
                        fields: [
                            {
                                name: userOne.username,
                                value: userOnePlayStr,
                                inline: true
                            },
                            {
                                name: userTwo.username,
                                value: userTwoPlayStr,
                                inline: true
                            }
                        ]
                    }], components: components
                });
            }
        }
    },
};
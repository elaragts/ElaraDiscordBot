const {SlashCommandBuilder, AttachmentBuilder} = require('discord.js');
const taikodb = require('@taikodb');
const bot = require('@bot');
const botdb = require('@botdb');
const data = require('@data');
const costume = require('@costume')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('playcount')
        .setDescription('Play Count')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to obtain the data from')
                .setRequired(false)
        )
    ,
    async execute(interaction) {
        let baid;
        if (interaction.options.getUser('user')) {
            baid = botdb.getBaidFromDiscordId(interaction.options.getUser('user').id);
            if (baid === undefined) {
                await bot.replyWithErrorMessage(interaction, 'Playcount', 'This user has not linked their discord account to their card yet!');
                return;
            }
        } else {
            baid = botdb.getBaidFromDiscordId(interaction.user.id);
            if (baid === undefined) {
                await bot.replyWithErrorMessage(interaction, 'Playcount', 'You have not linked your discord account to your card yet!');
                return;
            }
        }
        await interaction.deferReply();
        const countData = taikodb.getMonthlyPlayCount(baid);
        const userDonName = taikodb.getNameFromBaid(baid);
        const chartConfig = {
            chart: {
                type: 'line',
                data: {
                    labels: countData.map(d => d.Month),
                    datasets: [{
                        label: 'Play Count',
                        data: countData.map(d => d.PlayCount),
                        borderColor: '#e3685f',
                        fill: false,
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Play Count',
                                font: {
                                    size: 16  // Optional
                                }
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Month',
                                font: {
                                    size: 16  // Optional
                                }
                            }
                        }
                    },

                    plugins: {
                        datalabels: {
                            color: '#EB2353',  // Choose color for the datalabels
                            align: 'end',
                            anchor: 'end',
                            font: {
                                weight: 'bold',
                                size: 15
                            },
                            formatter: function (value, context) {
                                return value.toLocaleString();  // Formats numbers with commas, or use simply `value`
                            }
                        },
                        title: {
                            display: true,
                            text: `${userDonName}'s Monthly Play Count`,
                            font: {
                                size: 30
                            }
                        }
                    }
                }
            },
            width: 800,
            height: 600,
            backgroundColor: 'white',
            version: '4'
        };

        const response = await fetch('https://quickchart.io/chart/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(chartConfig)
        });

        if (!response.ok) {
            await bot.editReplyWithErrorMessage(interaction, 'Playcount', 'Graphing API responded with error');
        }
        const imageURL = (await response.json()).url
        //construct embed
        const returnEmbed = {
            color: 15410003,
            image: {
                url: imageURL,
            },
            author: {
                name: `Playcount`
            },
        };
        await interaction.editReply({embeds: [returnEmbed]});
    },
};
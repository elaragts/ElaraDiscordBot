const fs = require('node:fs');
const path = require('node:path');
const {Client, Collection, Events, GatewayIntentBits} = require('discord.js');
require('module-alias/register');
const {token} = require('./config.json');
const bot = require('@bot');
const backup = require('./backup.js')


const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent]});

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    backup.backupAndUpload(client)
    setInterval(() => {
        backup.backupAndUpload(client);
    }, 1000 * 60 * 60);
});

client.on(Events.InteractionCreate, async interaction => {
    try {
        if (interaction.isChatInputCommand()) await bot.handleChatInputCommand(interaction);
        if (interaction.isAutocomplete()) await bot.handleAutocomplete(interaction);
    } catch (e) {
        console.log(e)
    }
});

client.login(token);
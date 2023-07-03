//    ██╗  ██╗██╗   ██╗███████╗
//    ╚██╗██╔╝╚██╗ ██╔╝╚══███╔╝
//     ╚███╔╝  ╚████╔╝   ███╔╝ 
//     ██╔██╗   ╚██╔╝   ███╔╝  
// ██╗██╔╝ ██╗   ██║   ███████╗
// ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝

// Declare constants and import modules 
const { Client, GatewayIntentBits, REST, Routes, ActivityType } = require('discord.js');

// Import the config.json file
const config = require('./config/discord.json');

// Declare constants from config.json
const clientId = config.general.bot.clientId;
const channelId = config.general.topup_channel.channelId;
const botToken = config.general.bot.token;

// Import modules from my own files
const { sendWelcomeMessage } = require('./embed_builder/welcomeMessage');

// Import the welcome message function
const { deleteWelcomeMessage } = require('./functions/deleteWelcomeMessage');

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
    ]
});

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(botToken);

// Load all commands

// Import Loader.js from the commands folder
// const { ping, topup, rcon, help, setup, getrole, voucher, system } = require('./commands/loader');
const command = require('./commands/loader');

// Use Object.values() to get an array of all values (commands) from the command object
const commands = Object.values(command);

// Add new commands to the commands array directly within this loop
for (let i = 0; i < command.length; i++) {
    // Add the command to the commands array
    commands.push(command[i]);
}

// The rest of your code remains unchanged
(async () => {
    // Register slash commands
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();


// interactionCreate for reply slash commands when the command is executed
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    // Loop through the commands array and execute each command
    for (const cmd of commands) {
        if (cmd.name === commandName) {
            await cmd.execute(interaction);
            return;
        }
    }

    // Handle unrecognized commands
    await interaction.reply(`Sorry, I don't recognize the command ${commandName}`);
});


// When the client is ready, run this code (only once)
client.once('ready', async () => {
    console.log(`Ready! Logged in as ${client.user.tag}`);

    // Check if the channel ID is null
    if (channelId === null) {
    } else {
        // Delete the welcome message
        // deleteWelcomeMessage(client, channelId);

        // Send the welcome message
        // sendWelcomeMessage(client, channelId);
    }

    // Set the bot's activity
    client.user.setActivity({ name: '/help | /topup', type: ActivityType.Watching });


});

// Listen for messages
client.on('messageCreate', async (message) => {
    // If message is from bot, ignore
    if (message.author.bot) return;

    // If message is not from the channel we want, ignore
    // Don't delete messages from other channels
    if (message.channel.id !== channelId) return;

    // Delete the message (from every user except bot's)
    setTimeout(() => {
        message.delete()
            .then(deletedMessage => console.log("Message deleted."))
            .catch(console.error);
    }, 3000);

});

// Log in to Discord with your client's token
client.login(botToken);

//    ██╗  ██╗██╗   ██╗███████╗
//    ╚██╗██╔╝╚██╗ ██╔╝╚══███╔╝
//     ╚███╔╝  ╚████╔╝   ███╔╝
//     ██╔██╗   ╚██╔╝   ███╔╝
// ██╗██╔╝ ██╗   ██║   ███████╗
// ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝
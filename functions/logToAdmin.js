//    ██╗  ██╗██╗   ██╗███████╗
//    ╚██╗██╔╝╚██╗ ██╔╝╚══███╔╝
//     ╚███╔╝  ╚████╔╝   ███╔╝ 
//     ██╔██╗   ╚██╔╝   ███╔╝  
// ██╗██╔╝ ██╗   ██║   ███████╗
// ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝

/*
    * Send log the problem to the admin channel
    * For admin can understand and fix the problem
*/

const { Client, GatewayIntentBits } = require('discord.js');

const { sendEmbed } = require('../functions/sendEmbed');

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
    ]
});

// Get the bot token from the discord.json file
const { token } = require('../config/discord.json').general.bot;

// Create a function to log to the admin channel
const logToAdmin = async (messages) => {

    // Clear cache
    delete require.cache[require.resolve('../config/discord.json')];
    const discordConfig = require('../config/discord.json');

    delete require.cache[require.resolve('../config/embed.json')];
    const embedConfig = require('../config/embed.json');

    // Declare constants from embed.json
    const footerText = embedConfig.general.footerText
    const footerIcon = embedConfig.general.icon.footerIcon

    // Declare constants from config.json
    const adminChannelId = discordConfig.general.admin_channel.channelId;

    const logEmbed = sendEmbed('แจ้งเตือน', messages, '#00ff00', footerText, footerIcon);

    // Send the embed to the admin channel
    const adminChannel = client.channels.cache.get(adminChannelId);
    adminChannel.send({ embeds: [logEmbed] });


}

// Log in to Discord with your client's token
client.login(token);

// Export
module.exports = { logToAdmin }
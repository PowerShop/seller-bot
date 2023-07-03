//    ██╗  ██╗██╗   ██╗███████╗
//    ╚██╗██╔╝╚██╗ ██╔╝╚══███╔╝
//     ╚███╔╝  ╚████╔╝   ███╔╝ 
//     ██╔██╗   ╚██╔╝   ███╔╝  
// ██╗██╔╝ ██╗   ██║   ███████╗
// ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝

/*
    This is a command to check the status of the bot.
    You can modify the description in setDescription variable.
    You can modify the embed in sendEmbed function.
    Command: /status
*/

// Import the discord.js module
const { SlashCommandBuilder } = require('discord.js');

// Import sendEmbed function
const { sendEmbed } = require('../functions/sendEmbed');

// Create a new slash command: /status
const status = new SlashCommandBuilder()
    .setName('status')
    .setDescription('ตรวจสอบสถานะของบอท');

/*
    Your section is here
    You can modify the description in 
    const description = `Your description here`;


    Edit your description here
    %ping% = ping
    %memoryUsage% = memoryUsage
    %uptime% = uptime
*/

// Modify the description here
const setDescription = `
🏓 | Connection Speed: **%ping%ms**
🤯 | Memory Usage: **%memoryUsage%MB**
⏰ | Uptime: **%uptime%**
`;

// reply when the command is executed
status.execute = async (interaction) => {
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
    const uptime = formatUptime(process.uptime());

    // Create statusEmbed with sendEmbed function
    // title, description, color, footer, iconURL
    const ping = Date.now() - interaction.createdTimestamp;

    // Replace
    const description = setDescription.replace('%ping%', ping).replace('%memoryUsage%', memoryUsage.toFixed(2)).replace('%uptime%', uptime);

    const statusEmbed = sendEmbed(
        '🟢 Status',
        `${description}`,
        '#00ff00',
        'Status',
        'https://i.imgur.com/W1e9BvY.png'
    );

    // Reply with the embed
    // Reply with the embed and delete it after a certain timeout
    await interaction
        .reply({ embeds: [statusEmbed], ephemeral: true })
        .then((reply) => {
            setTimeout(() => {
                reply.delete();
            }, 20000); // Delete after 20 seconds
        });
}

// Function to format the uptime in a user-friendly format
function formatUptime(uptime) {
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
}

// Export the module
module.exports = status.toJSON();

//    ██╗  ██╗██╗   ██╗███████╗
//    ╚██╗██╔╝╚██╗ ██╔╝╚══███╔╝
//     ╚███╔╝  ╚████╔╝   ███╔╝
//     ██╔██╗   ╚██╔╝   ███╔╝
// ██╗██╔╝ ██╗   ██║   ███████╗
// ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝
//    ██╗  ██╗██╗   ██╗███████╗
//    ╚██╗██╔╝╚██╗ ██╔╝╚══███╔╝
//     ╚███╔╝  ╚████╔╝   ███╔╝ 
//     ██╔██╗   ╚██╔╝   ███╔╝  
// ██╗██╔╝ ██╗   ██║   ███████╗
// ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝

// Import the EmbedBuilder class
const { EmbedBuilder } = require('discord.js');

// Import the config.json file
const config = require('../config/embed.json');

const footerIcon = config.general.icon.footerIcon

// Create a function to send a welcome message
const sendWelcomeMessage = async (client, channelId) => {

    // Find the channel by its ID
    const channel = client.channels.cache.get(channelId);

    // Get the bot's uptime
    const upTimeStamp = client.readyTimestamp;
    const calUpTime = Date.now() - upTimeStamp;

    // Convert the uptime to a human-readable format
    const milliseconds = calUpTime % 1000;
    const seconds = Math.floor(calUpTime / 1000) % 60;
    const minutes = Math.floor(calUpTime / (1000 * 60)) % 60;
    const hours = Math.floor(calUpTime / (1000 * 60 * 60)) % 24;

    // Format the uptime
    const formattedUptime = `${hours} hours, ${minutes} minutes, ${seconds} seconds`;

    /*
    I wrote this code to show bot's uptime in the description
    If you want to use it, Add ${formattedUptime} to the description
    Like this: .setDescription(`บอทออนไลน์แล้วครับ\nออนไลน์มาแล้ว: ${formattedUptime}`)
    */

    // Create a new EmbedBuilder
    const embed = new EmbedBuilder()
        .setTitle('แจ้งเตือน')
        .setDescription(`บอทออนไลน์แล้วครับ`)
        .setColor('#00FF00')
        .setTimestamp()
        .setFooter({ text: '@ .xyz', iconURL: footerIcon })

    // Send the embed to the channel
    // If cannot send the message, log the error and return 
    channel.send({ embeds: [embed] });

}

// Export the function
module.exports = { sendWelcomeMessage };
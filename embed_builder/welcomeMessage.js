//    ██╗  ██╗██╗   ██╗███████╗
//    ╚██╗██╔╝╚██╗ ██╔╝╚══███╔╝
//     ╚███╔╝  ╚████╔╝   ███╔╝ 
//     ██╔██╗   ╚██╔╝   ███╔╝  
// ██╗██╔╝ ██╗   ██║   ███████╗
// ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝


// Import the config.json file
const config = require('../config/embed.json');

const footerIcon = config.general.icon.footerIcon
const footerText = config.general.footerText

// Import sendEmbed function
const { sendEmbed } = require('../functions/sendEmbed');

// Create a function to send a welcome message
const sendWelcomeMessage = async (client, channelId) => {

    // Find the channel by its ID
    const channel = client.channels.cache.get(channelId);

    // Create welcomeEmbed with sendEmbed function
    const welcomeEmbed = sendEmbed('แจ้งเตือน', `บอทออนไลน์แล้วครับ`, '#00FF00', footerText, footerIcon);

    // Send the embed to the channel
    // If cannot send the message, log the error and return 
    channel.send({ embeds: [welcomeEmbed] });

}

// Export the function
module.exports = { sendWelcomeMessage };
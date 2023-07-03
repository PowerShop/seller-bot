//    ██╗  ██╗██╗   ██╗███████╗
//    ╚██╗██╔╝╚██╗ ██╔╝╚══███╔╝
//     ╚███╔╝  ╚████╔╝   ███╔╝ 
//     ██╔██╗   ╚██╔╝   ███╔╝  
// ██╗██╔╝ ██╗   ██║   ███████╗
// ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝

// Create a function to send embed message
// Reg args: (title, description, color, footer, iconURL)

// Import the EmbedBuilder class from discord.js
const { EmbedBuilder } = require('discord.js');

// Import the config.json file if you need it
// const config = require('../config.json');

// Create embed builder function
function sendEmbed(title, description, color, footer, iconURL) {

    // Create a new embed
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp()
        .setFooter({ text: footer, iconURL: iconURL})

    // Return the embed
    return embed;
}

// ██╗  ██╗ ██████╗ ██╗    ██╗    ████████╗ ██████╗     ██╗   ██╗███████╗███████╗██████╗ 
// ██║  ██║██╔═══██╗██║    ██║    ╚══██╔══╝██╔═══██╗    ██║   ██║██╔════╝██╔════╝╚════██╗
// ███████║██║   ██║██║ █╗ ██║       ██║   ██║   ██║    ██║   ██║███████╗█████╗    ▄███╔╝
// ██╔══██║██║   ██║██║███╗██║       ██║   ██║   ██║    ██║   ██║╚════██║██╔══╝    ▀▀══╝ 
// ██║  ██║╚██████╔╝╚███╔███╔╝       ██║   ╚██████╔╝    ╚██████╔╝███████║███████╗  ██╗   
// ╚═╝  ╚═╝ ╚═════╝  ╚══╝╚══╝        ╚═╝    ╚═════╝      ╚═════╝ ╚══════╝╚══════╝  ╚═╝  

/*
    * const temp = sendEmbed('title', 'description', '#00ff00', 'footer', 'iconURL');
    * interaction.reply({ embeds: [temp] }); 
    * or 
    * message.channel.send({ embeds: [temp] });
*/

// More information about embed: https://discordjs.guide/popular-topics/embeds.html#embed-preview

// Export the function
module.exports = { sendEmbed };

//    ██╗  ██╗██╗   ██╗███████╗
//    ╚██╗██╔╝╚██╗ ██╔╝╚══███╔╝
//     ╚███╔╝  ╚████╔╝   ███╔╝ 
//     ██╔██╗   ╚██╔╝   ███╔╝  
// ██╗██╔╝ ██╗   ██║   ███████╗
// ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝
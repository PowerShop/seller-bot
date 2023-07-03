
//    ██╗  ██╗██╗   ██╗███████╗
//    ╚██╗██╔╝╚██╗ ██╔╝╚══███╔╝
//     ╚███╔╝  ╚████╔╝   ███╔╝ 
//     ██╔██╗   ╚██╔╝   ███╔╝  
// ██╗██╔╝ ██╗   ██║   ███████╗
// ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝

/*
    Just a simple help command
    Edit the embed in embed_builder\help.js
*/

// Import SlashCommandBuilder
const {SlashCommandBuilder } = require('discord.js');

// Import embed_builder
const { helpEmbed } = require('../embed_builder/help.js');

// Create a new SlashCommandBuilder: /help
const help = new SlashCommandBuilder()
    .setName('help')
    .setDescription('แสดงคำสั่งทั้งหมดของบอท');

// reply when the command is executed
help.execute = async function (interaction) {
    // reply with the embed
    // ephemeral: true = only the user who executed the command can see the reply
    await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
}

// Export the command
module.exports = help.toJSON();

//    ██╗  ██╗██╗   ██╗███████╗
//    ╚██╗██╔╝╚██╗ ██╔╝╚══███╔╝
//     ╚███╔╝  ╚████╔╝   ███╔╝ 
//     ██╔██╗   ╚██╔╝   ███╔╝  
// ██╗██╔╝ ██╗   ██║   ███████╗
// ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝
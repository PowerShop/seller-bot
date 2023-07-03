//    ██╗  ██╗██╗   ██╗███████╗
//    ╚██╗██╔╝╚██╗ ██╔╝╚══███╔╝
//     ╚███╔╝  ╚████╔╝   ███╔╝ 
//     ██╔██╗   ╚██╔╝   ███╔╝  
// ██╗██╔╝ ██╗   ██║   ███████╗
// ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝

/*
    This command is used to restart the bot but you need to run bot's with pm2 or something to auto restart the bot
    If you don't want to use this command, you can delete this file or never run it
    Command: /system restart
*/

// Import discord.js module
const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// Import config
const config = require('../config/embed.json');
const footerIcon = config.general.icon.footerIcon;
const footerText = config.general.footerText;

// Create a command: "system"
const system = new SlashCommandBuilder()
    .setName('system')
    .setDescription('เกี่ยวกับระบบ')
    .addSubcommand(subcommand =>
        subcommand
            .setName('restart')
            .setDescription('รีสตาร์ทบอท')
    )
    // Only admins can execute this command
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

// reply when the command is executed
system.execute = async function (interaction) {

    // if the subcommand is "restart"
    if (interaction.options.getSubcommand() === 'restart') {

        // reply with a message
        const embed = new EmbedBuilder()
            .setTitle('แจ้งเตือน')
            .setDescription('กำลังรีสตาร์ทบอท...')
            .setColor('#FF0000')
            .setTimestamp()
            .setFooter({ text: footerText, iconURL: footerIcon })
        await interaction.reply({ embeds: [embed], ephemeral: true });

        // restart the bot
        process.exit();
    }
}

// export the command
module.exports = system.toJSON();

//    ██╗  ██╗██╗   ██╗███████╗
//    ╚██╗██╔╝╚██╗ ██╔╝╚══███╔╝
//     ╚███╔╝  ╚████╔╝   ███╔╝ 
//     ██╔██╗   ╚██╔╝   ███╔╝  
// ██╗██╔╝ ██╗   ██║   ███████╗
// ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝
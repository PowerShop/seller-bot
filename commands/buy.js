// Import EmbedBuilder & SlashCommandBuilder
const { SlashCommandBuilder } = require('discord.js');

// Import discord.json
const discordConfig = require('../config/discord.json');

// Import the embed.json file
const config = require('../config/embed.json');
const footerIcon = config.general.icon.footerIcon;
const footerText = config.general.footerText;

// Import sendEmbed function
const { sendEmbed } = require('../functions/sendEmbed');

// Import tw-voucher
const twvoucher = require('@fortune-inc/tw-voucher');

// Declare variable: transaction-log
const transactionLog = discordConfig.general.transaction_logs.channelId;

// Create a new command: /topup <username> <url>
const buy = new SlashCommandBuilder()
    .setName('buy')
    .setDescription('เติมเงินผ่าน TrueWallet')
    // Option select
    .addStringOption(option =>
        option.setName('select')
            .setDescription('เลือกสินค้าที่ต้องการซื้อ')
            .setRequired(true)
            .addChoices({ name: 'บอทเติมเงิน', value: 'voucher-bot' })
    )
    // Option url
    .addStringOption(option =>
        option.setName('url')
            .setDescription('ลิ้งค์ซองของขวัญ')
            .setRequired(true)

    )

// Execute the command

// reply when the command is executed
buy.execute = async function (interaction) {
    // If the subcommand is voucher-bot
    
        // Get the url
        const url = interaction.options.getString('url');
        const select = interaction.options.getString('select');

        // Create embed
        const reply = sendEmbed('แจ้งเตือน', `ท่านได้สั่งซื้อ ${select} ด้วยซอง ${url}`, '#00ff00', footerText, footerIcon);

        // Send the embed
        interaction.reply({ embeds: [reply], ephemeral: true });

    
}

// Export the command
module.exports = buy.toJSON();
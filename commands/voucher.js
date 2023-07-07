//    ██╗  ██╗██╗   ██╗███████╗
//    ╚██╗██╔╝╚██╗ ██╔╝╚══███╔╝
//     ╚███╔╝  ╚████╔╝   ███╔╝ 
//     ██╔██╗   ╚██╔╝   ███╔╝  
// ██╗██╔╝ ██╗   ██║   ███████╗
// ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝

/*
    This command is for check the voucher is available or not and get the details of the voucher
    Command: /voucher <url>
*/

// Import discord.js module
const { SlashCommandBuilder } = require('discord.js');

// Import sendEmbed function
const { sendEmbed } = require('../functions/sendEmbed');

// Import config
const topupConfig = require('../config/topup.json');

// Import embed.json
const embedConfig = require('../config/embed.json');
const footerIcon = embedConfig.general.icon.footerIcon;
const footerText = embedConfig.general.footerText;

// Create a new command: /voucher <url>
const voucher = new SlashCommandBuilder()
    .setName('voucher')
    .setDescription('ตรวจสอบซองของขวัญ')
    .addStringOption(option =>
        option.setName('url')
            .setDescription('ลิ้งซองของขวัญ')
            .setRequired(true));

// reply when the command is executed
voucher.execute = async function (interaction) {

    // Get the url from the interaction
    const url = interaction.options.getString('url');

    // Get after ?v
    const voucherUrl = url.split('?v=')[1];

    // Verify the url is format like https://gift.truemoney.com/campaign/?v=xxxxx

    if (url !== 'https://gift.truemoney.com/campaign/?v=' + voucherUrl) {

        // Create errorEmbed with sendEmbed function
        const errorEmbed = sendEmbed('ตรวจสอบซองของขวัญ', 'ลิ้งซองของขวัญไม่ถูกต้อง', '#ff0000', footerText, footerIcon);
        
        // Reply the errorEmbed
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });

        // Log to console, if you want
        // console.log(`[LOG] ${interaction.user.tag} check voucher: ${url}`);
    }
    else {

        // Verify the url and get data
        const response = await fetch(`https://gift.truemoney.com/campaign/vouchers/${voucherUrl}/verify?mobile=${topupConfig.voucher.phone}`);

        // Get the data
        const voucherData = await response.json();

        const code = voucherData.status.code;
        // Check the code and set the status
        let statusCode;

        // Handle the code
        switch (code) {
            case 'VOUCHER_NOT_FOUND':
                statusCode = 'ไม่พบซองของขวัญ';
                break;
            case 'VOUCHER_OUT_OF_STOCK':
                statusCode = 'ซองของขวัญถูกใช้งานหมดแล้ว';
                break;
            case 'VOUCHER_EXPIRED':
                statusCode = 'ซองของขวัญหมดอายุแล้ว';
                break;
            case 'INTERNAL_ERROR':
                statusCode = 'ไม่สามารถตรวจสอบซองของขวัญได้/ลิ้งซองของขวัญไม่ถูกต้อง';
                break;
            default:
                statusCode = 'ไม่พบข้อผิดพลาด/ไม่ทราบสาเหตุ';
        }

        // Create voucherEmbed with sendEmbed function
        const voucherEmbed = sendEmbed('ตรวจสอบซองของขวัญ', `เจ้าของซอง: ${voucherData.data.owner_profile.full_name}\nสถานะ: ${statusCode} \nจำนวนเงินในซอง: ${voucherData.data.voucher.amount_baht} บาท\nถูกใช้ไปแล้ว: ${voucherData.data.voucher.redeemed_amount_baht} บาท \nคงเหลือใช้งาน: (${voucherData.data.voucher.available}/${voucherData.data.voucher.redeemed} ครั้ง)`, '#0099FF', footerText, footerIcon);

        // Reply the embed
        await interaction.reply({ embeds: [voucherEmbed], ephemeral: true });

        // Log to console, if you want
        // console.log(`[LOG] ${interaction.user.tag} check voucher: ${url}`);
    }
}

// Export the command
module.exports = voucher.toJSON();

//    ██╗  ██╗██╗   ██╗███████╗
//    ╚██╗██╔╝╚██╗ ██╔╝╚══███╔╝
//     ╚███╔╝  ╚████╔╝   ███╔╝
//     ██╔██╗   ╚██╔╝   ███╔╝
// ██╗██╔╝ ██╗   ██║   ███████╗
// ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝
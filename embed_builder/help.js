//    ██╗  ██╗██╗   ██╗███████╗
//    ╚██╗██╔╝╚██╗ ██╔╝╚══███╔╝
//     ╚███╔╝  ╚████╔╝   ███╔╝ 
//     ██╔██╗   ╚██╔╝   ███╔╝  
// ██╗██╔╝ ██╗   ██║   ███████╗
// ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝

const { EmbedBuilder } = require('discord.js');

// Import config
const embedConfig = require('../config/embed.json');


    // Create a embed for help
    const helpEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('คำสั่ง')
        .setTimestamp()
        .setFooter({ text: embedConfig.general.footerText, iconURL: embedConfig.general.icon.footerIcon })
        .addFields(
            { name: '**/topup**', value: 'เติมเงินด้วยซองของขวัญ' },
            { name: '**/voucher**', value: 'ตรวจสอบสถานะซองของขวัญ (ไม่มีการใช้งานซอง)' },
            
            // Add more fields here as needed
        );

// Export module
module.exports = { helpEmbed };

//    ██╗  ██╗██╗   ██╗███████╗
//    ╚██╗██╔╝╚██╗ ██╔╝╚══███╔╝
//     ╚███╔╝  ╚████╔╝   ███╔╝ 
//     ██╔██╗   ╚██╔╝   ███╔╝  
// ██╗██╔╝ ██╗   ██║   ███████╗
// ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝
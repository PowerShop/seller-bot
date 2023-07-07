//    ██╗  ██╗██╗   ██╗███████╗
//    ╚██╗██╔╝╚██╗ ██╔╝╚══███╔╝
//     ╚███╔╝  ╚████╔╝   ███╔╝ 
//     ██╔██╗   ╚██╔╝   ███╔╝  
// ██╗██╔╝ ██╗   ██║   ███████╗
// ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝

/*
    This command is used to topup money to the player's account in your Minecraft server.
    Command: /topup <username> <url>
*/

// Import EmbedBuilder & SlashCommandBuilder
const { SlashCommandBuilder } = require('discord.js');

// Import discord.json
const discordConfig = require('../config/discord.json');

// Import the embed.json file
const config = require('../config/embed.json');
const footerIcon = config.general.icon.footerIcon;
const footerText = config.general.footerText;

// Import tw-voucher
const twvoucher = require('@fortune-inc/tw-voucher');

// Import the function sendCommand
const { sendTopupCommands } = require('../functions/sendCommand');

// Import sendEmbed function
const { sendEmbed } = require('../functions/sendEmbed');

// Import logToAdmin function
const { logToAdmin } = require('../functions/logToAdmin');

// Import convertErrorMsg
const { convertErrorMsg } = require('../functions/convertErrorMsg');

// Import rcon
const { Rcon } = require('minecraft-rcon-client');

// Declare variable: transaction-log
const transactionLog = discordConfig.general.transaction_logs.channelId;

// Create a new command: /topup <username> <url>
const topup = new SlashCommandBuilder()
    .setName('topup')
    .setDescription('เติมเงินผ่าน TrueWallet')
    // Add options
    .addStringOption(option =>
        option.setName('username')
            .setDescription('ชื่อในเกม')
            .setRequired(true)
    )
    // Url truewallet
    .addStringOption(option =>
        option.setName('url')
            .setDescription('ลิ้งค์ TrueWallet')
            .setRequired(true)
    )
    // For testing only
    .addStringOption(option =>
        option.setName('amount')
            .setDescription('จำนวนเงินที่ต้องการเติม')
            .setRequired(true)
    )

// reply when the command is executed
topup.execute = async function (interaction) {

    // Get the username and url from the user
    const username = interaction.options.getString('username');
    const url = interaction.options.getString('url');
    const amount = interaction.options.getString('amount');
    // const amount = 500;

    // Clear cache before use
    delete require.cache[require.resolve('../config/topup.json')];
    const topupJson = require('../config/topup.json');

    // Get rate from topup.json
    const rate = topupJson.voucher.rate;
    const phone = topupJson.voucher.phone;

    // Clear cache before use
    delete require.cache[require.resolve('../config/server.json')];
    const serverConfig = require('../config/server.json');

    // Check if server is online ? offline
    // if (await isOnline()) {                                                                                                                                       
    const host = serverConfig.general.rcon.host
    const port = serverConfig.general.rcon.port;
    const password = serverConfig.general.rcon.password;
    const timeout = serverConfig.general.rcon.timeout;

    // Get user id
    const user = interaction.user.id;

    // Connect to rcon
    function connectToRcon(port, host, password, timeout) {
        return new Promise((resolve, reject) => {
            const client = new Rcon({ port, host, password });

            const timeoutId = setTimeout(() => {
                clearTimeout(timeoutId);
                // console.log('หมดเวลาการเชื่อมต่อเซิร์ฟเวอร์');

                // Reject the promise to indicate the connection timeout
                reject(new Error('Connection timeout'));
            }, timeout);

            // เมื่อ Timeout เสร็จสิ้น
            timeoutId.unref();

            // Connect to rcon
            client.connect()
                .then(() => {
                    console.log('เชื่อมต่อเซิร์ฟเวอร์สำเร็จ');
                    clearTimeout(timeoutId);
                    resolve(client);
                })
                .catch(err => {
                    // console.log('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ สาเหตุ: ' + err.message);
                    
                    clearTimeout(timeoutId);

                    // Reject the promise to indicate the connection timeout
                    reject(new Error(err));
                });
        });
    }

    connectToRcon(port, host, password, timeout)
        .then(client => {
            // ทำสิ่งที่ต้องการที่นี่

            // Start the topup process
            twvoucher(phone, url).then(redeemed => {

                // Get amount from redeemed
                const topupAmount = redeemed.amount * rate;

                // Create a topupSuccess embed with sendEmbed function
                const topupSuccess = sendEmbed('แจ้งเตือน', `<@${user}> เติมเงินสำเร็จ จำนวน **${topupAmount}** บาท`, '#FF0000', footerText, footerIcon);

                // Send the embed to the channel
                interaction.reply({ embeds: [topupSuccess], ephemeral: true });

                // Log the redeem code to console
                console.log(`redeem ซอง ${redeemed.code} ของ ${redeemed.owner_full_name} จำนวน ${redeemed.amount} บาทแล้ว`)

                // Send the embed to the log channel if enabled
                if (discordConfig.general.transaction_logs.enabled === true) {

                    // Create a log embed with sendEmbed function
                    const log = sendEmbed('LOG - เติมเงิน', `ผู้เล่น **${username}** เติมเงินสำเร็จ \nจำนวน **${topupAmount}** บาท \nลิ้งก์ซอง ${url}`, '#FF0000', footerText, footerIcon);

                    // Send log to discord channelid from config.server.log_channel_id
                    const channel = interaction.client.channels.cache.get(transactionLog);

                    // Send the embed to the channel
                    channel.send({ embeds: [log] });

                }

                // Import condition from topup.json
                const topupCondition = topupJson.topup.condition;

                // Call the function sendTopupCommands
                sendTopupCommands(topupCondition, redeemed.amount, username, rate);


            }).catch(async err => {
                // Handle error
                const errMessage = err.message.replace('Error: ', '');
                let realErrMessage;
                switch (errMessage) {
                    case 'INVAILD_VOUCHER':
                        realErrMessage = 'ลิ้งก์ไม่ถูกต้อง';
                        break;
                    case 'VOUCHER_EXPIRED':
                        realErrMessage = 'ลิ้งก์หมดอายุ';
                        break;
                    case 'INTERNAL_ERROR':
                        realErrMessage = 'เกิดข้อผิดพลาดภายในระบบ';
                        break;
                    case 'VOUCHER_NOT_FOUND':
                        realErrMessage = 'ไม่พบซองนี้ในระบบ';
                        break;
                    case 'VOUCHER_OUT_OF_STOCK':
                        realErrMessage = 'ซองถูกใช้งานหมดแล้ว';
                        break;
                    default:
                        realErrMessage = 'ไม่ทราบสาเหตุ';
                        break;
                }

                // Create a topupFail embed with sendEmbed function and send it to the user

                const topupFail = sendEmbed('แจ้งเตือน', `<@${user}> เติมเงินไม่สำเร็จ \n เหตุผล: **${realErrMessage}**\nโปรดลองใหม่อีกครั้งครับ`, '#ff0000', footerText, footerIcon);

                // Reply message to user who topup and hide from other user
                // Interaction reply
                await interaction.reply({ embeds: [topupFail], ephemeral: true });

                // Send log to discord channelid from transactionLog
                const channel = interaction.client.channels.cache.get(transactionLog);

                // Send the embed to the log channel if enabled
                if (discordConfig.general.transaction_logs.enabled === true) {

                    // Create a log embed with sendEmbed function
                    const log = sendEmbed('LOG - เติมเงิน', `ผู้เล่น **${username}** เติมเงินไม่สำเร็จ \nเหตุผล: **${realErrMessage}** \nลิ้งก์ซอง: \||${url}\||`, '#ff0000', footerText, footerIcon);

                    // Send the embed to the channel
                    channel.send({ embeds: [log] });
                }

                // Log the error to console
                console.error("ผู้เล่น " + username + " เติมเงินไม่สำเร็จ: " + realErrMessage + " => " + url)

                // Send command to server when topup fail
                // sendCommand("fail", username);


                // ██████╗ ███████╗██████╗ ██╗   ██╗ ██████╗ 
                // ██╔══██╗██╔════╝██╔══██╗██║   ██║██╔════╝ 
                // ██║  ██║█████╗  ██████╔╝██║   ██║██║  ███╗
                // ██║  ██║██╔══╝  ██╔══██╗██║   ██║██║   ██║
                // ██████╔╝███████╗██████╔╝╚██████╔╝╚██████╔╝
                // ╚═════╝ ╚══════╝╚═════╝  ╚═════╝  ╚═════╝

                // Always send command to server when topup fail
                // debug = true; debug = false;
                const debug = false;

                if (debug === true) {

                    // Import condition from topup.json
                    const topupCondition = topupJson.topup.condition;

                    // Call the function sendTopupCommands
                    sendTopupCommands(topupCondition, amount, username, rate);

                }
            })

        })
        .catch(err => {
            
            // replace Error: to empty string
            err.message = err.message.replace('Error: ', '');
            console.log(err.message);

            // Use convertErrorMsg function to convert error message to friendly message
            err.message = convertErrorMsg(err.message);

            // Create a timeOutError embed with sendEmbed function and send it to the user
            const errorMsg = sendEmbed('แจ้งเตือน', `ไม่สามารถเติมเงินได้ โปรดติดต่อผู้ดูแลเซิร์ฟเวอร์\nสาเหตุ: **${err.message}**\n\n***ซองของขวัญยังไม่ถูกใช้งาน**`, '#FF0000', footerText, footerIcon);
            interaction.reply({ embeds: [errorMsg], ephemeral: true });
            
            
            // Call the function logToAdmin
            logToAdmin(`ผู้เล่น ${username} เติมเงินไม่สำเร็จ\n เหตุผล: **${err.message}**`);
        });
}

// Export the command
module.exports = topup;
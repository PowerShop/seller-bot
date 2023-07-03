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

let terror;
terror = false;

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

// Import rcon
const { Rcon } = require('minecraft-rcon-client');

// Declare variable: transaction-log
const transactionLog = discordConfig.general.transaction_logs.channelId;

// Create a new command: /topup <username> <url>
const newtopup = new SlashCommandBuilder()
    .setName('newtopup')
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
newtopup.execute = async function (interaction) {

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

    // Check if rcon can connect ? can't connect
    // const rconClient = new Rcon({ port, host, password });

    // Connect to rcon
    function connectToRcon(port, host, password, timeout) {
        return new Promise((resolve, reject) => {
            const client = new Rcon({ port, host, password });

            const timeoutId = setTimeout(() => {
                // const timeOutError = sendEmbed('แจ้งเตือน', 'เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ\nโปรดติดต่อผู้ดูแลเซิร์ฟเวอร์\nสาเหตุที่เกี่ยวข้อง: Rcon Port อาจไม่ถูกต้อง', '#FF0000', footerText, footerIcon);
                // interaction.reply({ embeds: [timeOutError], ephemeral: true });
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
                const topupSuccess = sendEmbed('แจ้งเตือน', `**${username}** เติมเงินสำเร็จ จำนวน **${topupAmount}** บาท`, '#FF0000', footerText, footerIcon);

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

                const topupFail = sendEmbed('แจ้งเตือน', `**${username}** เติมเงินไม่สำเร็จ \n เหตุผล: **${realErrMessage}**\nโปรดลองใหม่อีกครั้ง`, '#FF0000', footerText, footerIcon);

                // Reply message to user who topup and hide from other user
                // Interaction reply
                await interaction.reply({ embeds: [topupFail], ephemeral: true });

                // Send log to discord channelid from transactionLog
                const channel = interaction.client.channels.cache.get(transactionLog);

                // Send the embed to the log channel if enabled
                if (discordConfig.general.transaction_logs.enabled === true) {

                    // Create a log embed with sendEmbed function
                    const log = sendEmbed('LOG - เติมเงิน', `ผู้เล่น **${username}** เติมเงินไม่สำเร็จ \nเหตุผล: **${realErrMessage}** \nลิ้งก์ซอง: \||${url}\||`, '#FF0000', footerText, footerIcon);

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
            console.log(err.message);
            // Rewrite err.message
            // Use Switch Case
            switch (err.message) {
                case 'Authentication error':
                    err.message = 'รหัสผ่านของ RCON ไม่ถูกต้อง';
                    break;
                case 'Connection timeout':
                    err.message = 'Connection timeout ตรวจสอบ IP และ Port ให้ถูกต้อง';
                    break;
                default:
                    err.message = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้';
                    break;
            }
            const timeOutError = sendEmbed('แจ้งเตือน', `ไม่สามารถเติมเงินได้ โปรดติดต่อผู้ดูแลเซิร์ฟเวอร์\nสาเหตุ: **${err.message}**\n\n***ซองของขวัญยังไม่ถูกใช้งาน**`, '#FF0000', footerText, footerIcon);
            interaction.reply({ embeds: [timeOutError], ephemeral: true });
        });


    // rconClient.connect().then(() => {
    //     // Continue if rcon can connect



    //     // Disconnect rcon
    //     rconClient.disconnect()
    // }).catch(err => {
    //     // Handle error
    //     console.log("Connection to server cannot be established!")
    //     const rconEmbedError = sendEmbed('แจ้งเตือน', `ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้`, '#FF0000', footerText, footerIcon);
    //     interaction.reply({ embeds: [rconEmbedError], ephemeral: true });
    // })

}

// Export the command
module.exports = newtopup;
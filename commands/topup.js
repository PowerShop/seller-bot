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

let timeOutError;

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

const { resolve } = require('path');

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

    // Check if server is offline or online
    // const isOnline = require('../functions/statusServer');

    // Clear cache before use
    delete require.cache[require.resolve('../config/server.json')];
    const serverConfig = require('../config/server.json');

    // Try to check if server ? online : offline and then check if rcon ? can connect : can't connect
    // (async () => {

        // Check if server is online ? offline
        // if (await isOnline()) {
        const host = serverConfig.general.rcon.host
        const port = serverConfig.general.rcon.port;
        const password = serverConfig.general.rcon.password;
        const timeout = serverConfig.general.rcon.timeout;
        // If server is online, continue
        async function connectToRconWithTimeout(port, host, password, timeout) {
            // Creating a promise that will resolve after connecting to the rcon

            const rconConnectPromise = new Promise(async (resolve, reject) => {
                try {
                    const rcon = new Rcon({ port, host, password });
                    await rcon.connect();
                    resolve(rcon);
                } catch (e) {
                    reject(e);
                }
            });

            // Wrapping the rcon connection promise with a timer promise that will reject if time runs out
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error("Connection timed out | Check your server status or rcon config"));
                    timeOutError = 'Connection timed out';
                }, timeout);
            });

            // Waiting for either the rcon connection to succeed or the time to run out
            const result = await Promise.race([rconConnectPromise, timeoutPromise]);

            // Log to console
            console.log("Test connection to RCON before topup => Success!");

            // If the rcon connection succeeded, continue;

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
                const debug = true;

                if (debug === true) {

                    // Import condition from topup.json
                    const topupCondition = topupJson.topup.condition;

                    // Call the function sendTopupCommands
                    sendTopupCommands(topupCondition, amount, username, rate);

                }
            })
        }
        // If can't connect to RCON
        try {

            const rconTimeoutMs = timeout; // Maximum time in milliseconds allowed to establish a connection
            const rconEmbeds = await connectToRconWithTimeout(port, host, password, rconTimeoutMs);
            // const rconEmbed = sendEmbed('แจ้งเตือน', `ไม่สามารถเชื่อมต่อไปยัง RCON ของเซิร์ฟเวอร์ได้\nโปรดติดต่อผู้ดูแลเซิร์ฟเวอร์`, '#ff0000', footerText, footerIcon);

            await interaction.reply({ embeds: [rconEmbeds], ephemeral: true });
            return;
        } catch (error) {
            // sendEmbed and timeOutError and error is defined
            const errMessage = error.message.replace('Error: ', '');
            console.log(errMessage);
            if (errMessage === 'Connection error' || errMessage === 'Authentication error' || timeOutError === 'Connection timed out') {
                const rconEmbed = sendEmbed('แจ้งเตือน', `ไม่สามารถเชื่อมต่อไปยัง RCON ของเซิร์ฟเวอร์ได้\nโปรดติดต่อผู้ดูแลเซิร์ฟเวอร์\nสาเหตุ: **\`${errMessage}\`**`, '#ff0000', footerText, footerIcon);
                await interaction.reply({ embeds: [rconEmbed], ephemeral: true });
                return;        
            } else {
                console.log(errMessage);
                const rconEmbed = sendEmbed('แจ้งเตือน', `ไม่สามารถเชื่อมต่อไปยัง RCON ของเซิร์ฟเวอร์ได้\nโปรดติดต่อผู้ดูแลเซิร์ฟเวอร์\nสาเหตุ: **\`${errMessage}\`**`, '#ff0000', footerText, footerIcon);
                // await interaction.reply({ embeds: [rconEmbed], ephemeral: true });
                // reject(rconEmbed);
                return;
            }
            // await interaction.followUp({ embeds: [embeds], ephemeral: true });

        }
        // Return true to stop the function
        // } else {
        //     const fail = sendEmbed('แจ้งเตือน', 'ขออภัย ขณะนี้เซิร์ฟเวอร์ไม่ได้เปิดทำการ จึงไม่สามารถเติมเงินได้ \nหากนี่เป็นข้อผิดพลาด โปรดแจ้งไปยังผู้ดูแลเซิร์ฟเวอร์', '#ff0000', footerText, footerIcon);
        //     await interaction.reply({ embeds: [fail], ephemeral: true });
        //     return false;
        // }
    // })();
}

// Export the module
module.exports = topup.toJSON();

//    ██╗  ██╗██╗   ██╗███████╗
//    ╚██╗██╔╝╚██╗ ██╔╝╚══███╔╝
//     ╚███╔╝  ╚████╔╝   ███╔╝
//     ██╔██╗   ╚██╔╝   ███╔╝
// ██╗██╔╝ ██╗   ██║   ███████╗
// ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝
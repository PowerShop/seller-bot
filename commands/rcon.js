//    ██╗  ██╗██╗   ██╗███████╗
//    ╚██╗██╔╝╚██╗ ██╔╝╚══███╔╝
//     ╚███╔╝  ╚████╔╝   ███╔╝ 
//     ██╔██╗   ╚██╔╝   ███╔╝  
// ██╗██╔╝ ██╗   ██║   ███████╗
// ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝

/*
    * คำสั่ง RCON
    * ใช้สำหรับจัดการ RCON ของเซิฟเวอร์
    * Command: /rcon sendcommand <command>
    * Command: /rcon testconnect
    * Command: /rcon getconfig
    * Command: /rcon setconfig <host> <port> <password>
    
*/

// Import the config.json file
let config;
// config = require('../config.json');
config = require('../config/server.json');

const embedConfig = require('../config/embed.json');
const footerIcon = embedConfig.general.icon.footerIcon;
const footerText = embedConfig.general.footerText;

// Import fs
const fs = require('fs');

// Import path
const path = require('path');

// Import function sendEmbed
const { sendEmbed } = require('../functions/sendEmbed.js');

// Import convertErrorMsg
const { convertErrorMsg } = require('../functions/convertErrorMsg');

// Import rcon
const { Rcon } = require('minecraft-rcon-client')

// Import EmbedBuilder & SlashCommandBuilder
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');


const rcon = new SlashCommandBuilder()
    .setName('rcon')
    .setDescription('Manage RCON')

    // Send command ส่งคำสั่งผ่าน RCON Command: /rcon sendcommand <command>
    .addSubcommand(subcommand =>
        subcommand
            .setName('sendcommand')
            .setDescription('ส่งคำสั่งผ่าน RCON')
            .addStringOption(option =>
                option.setName('command')
                    .setDescription('คำสั่งที่ต้องการส่ง')
                    .setRequired(true))
    )

    // Test connect ทดลองเชื่อมต่อ RCON
    .addSubcommand(subcommand =>
        subcommand
            .setName('testconnect')
            .setDescription('ทดสอบการเชื่อมต่อ RCON')
    )

    // Get config ดึงการตั้งค่าของ RCON มาแสดง
    .addSubcommand(subcommand =>
        subcommand
            .setName('getconfig')
            .setDescription('ดูการตั้งค่า config ของ RCON')
    )

    // Set config ของ RCON Command: /rcon setconfig <host> <port> <password>
    .addSubcommand(subcommand =>
        subcommand
            .setName('setconfig')
            .setDescription('ตั้งค่า config ของ RCON')
            .addStringOption(option =>
                option.setName('host')
                    .setDescription('IP ของ RCON')
                    .setRequired(false))
            .addStringOption(option =>
                option.setName('port')
                    .setDescription('Port ของ RCON')
                    .setRequired(false))
            .addStringOption(option =>
                option.setName('password')
                    .setDescription('รหัสผ่าน RCON')
                    .setRequired(false))
            .addStringOption(option =>
                option.setName('timeout')
                    .setDescription('เวลาที่ใช้ในการเชื่อมต่อ RCON (timeout)')
                    .setRequired(false))
    )

    // rcon manage button
    .addSubcommand(subcommand =>
        subcommand
            .setName('manage')
            .setDescription('จัดการ RCON')
    )

    // Admin only can execute this command
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

// reply when the command is executed
rcon.execute = async function (interaction) {
    // If subcommand is testconnect or sendcommand
    if (interaction.options.getSubcommand() === 'testconnect' || interaction.options.getSubcommand() === 'sendcommand') {
        // Clear cache before use
        delete require.cache[require.resolve('../config/server.json')];

        let serverConfig;
        try {
            serverConfig = require('../config/server.json');
        } catch (e) {
            console.error("Can't read server config file.");
            const embeds = sendEmbed('แจ้งเตือน', `ไม่สามารถอ่านไฟล์ config/server.json ได้`, '#ff0000', footerText, footerIcon);
            await interaction.reply({ embeds: [embeds], ephemeral: true });
            return;
        }

        const host = serverConfig.general.rcon.host
        const port = serverConfig.general.rcon.port;
        const password = serverConfig.general.rcon.password;
        const timeout = serverConfig.general.rcon.timeout;

        async function connectToRconWithTimeout(port, host, password, timeout, command = null) {
            // Creating a promise that will resolve after connecting to the rcon
            const rconConnectPromise = new Promise(async (resolve, reject) => {
                try {
                    const rcon = new Rcon({ port, host, password });
                    await rcon.connect();
                    if (command) {
                        await rcon.send(command);
                        console.log(`Sent command: ${command}`);
                    }
                    resolve(rcon);
                } catch (e) {
                    reject(e);
                }
            });

            // Wrapping the rcon connection promise with a timer promise that will reject if time runs out
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error("Connection timed out"));
                }, timeout);
            });

            // Waiting for either the rcon connection to succeed or the time to run out
            const result = await Promise.race([rconConnectPromise, timeoutPromise]);

            // Log to console
            console.log("Test connect to RCON success");

            // Creating and returning an embed in case of success
            if (command === null) {
                return sendEmbed('แจ้งเตือน', `ทดสอบการเชื่อมต่อ RCON สำเร็จ`, '#00ff00', footerText, footerIcon);
            } else {
                return sendEmbed('แจ้งเตือน', `ส่งคำสั่ง: \`${command}\` สำเร็จแล้ว`, '#00ff00', footerText, footerIcon);
            }
        }

        const command = interaction.options.getString('command');

        try {
            const rconTimeoutMs = timeout; // Maximum time in milliseconds allowed to establish a connection
            const rconEmbed = await connectToRconWithTimeout(port, host, password, rconTimeoutMs, command);

            await interaction.reply({ embeds: [rconEmbed], ephemeral: true });
        } catch (e) {
            // Replace e.message with a more user friendly message via switch case
            // Use convertErrorMsg function to convert error message to friendly message
            e.message = convertErrorMsg(e.message);

            // Log to console
            console.error("Can't connect to rcon server: " + e.message);

            // Create embeds with sendEmbed function
            const embeds = sendEmbed('แจ้งเตือน', `ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้\nสาเหตุ: ${e.message}`, '#ff0000', footerText, footerIcon);

            // Send embeds to user
            await interaction.reply({ embeds: [embeds], ephemeral: true });
        }
    }
    // If subcommand is getconfig
    else if (interaction.options.getSubcommand() === 'getconfig') {
        delete require.cache[require.resolve('../config/server.json')];
        const config = require('../config/server.json');
        // Get new config values
        const host = config.general.rcon.host;
        const port = config.general.rcon.port;
        const password = config.general.rcon.password;
        const timeout = config.general.rcon.timeout;

        // Create embeds with sendEmbed function
        const embeds = sendEmbed('แจ้งเตือน', `**การตั้งค่า RCON**\n**Host:** ${host}\n**Port:** ${port}\n**Password:** ${password}\n**Timeout:** ${timeout}`, '#00ff00', 'RCON', footerIcon);

        // Reply to user
        interaction.reply({ embeds: [embeds], ephemeral: true });

    } else if (interaction.options.getSubcommand() === 'setconfig') {
        // Get new config values
        const ip = interaction.options.getString('host');
        const port = interaction.options.getString('port');
        const password = interaction.options.getString('password');
        const timeout = interaction.options.getString('timeout');

        // Update config.json with new values
        function updateConfig() {
            const updateConfigPath = path.join(__dirname, '../config/server.json');
            try {
                // Read the config file
                const data = fs.readFileSync(updateConfigPath, 'utf8');
                const oldConfig = JSON.parse(data);

                // Create a new config object with updated values
                const newConfig = {
                    ...oldConfig,
                    general: {
                        rcon: {
                            host: ip || oldConfig.general.rcon.host,
                            port: parseInt(port) || oldConfig.general.rcon.port,
                            password: password || oldConfig.general.rcon.password,
                            timeout: parseInt(timeout) || oldConfig.general.rcon.timeout
                        }
                    }
                };

                // Write the updated config to the file
                fs.writeFileSync(updateConfigPath, JSON.stringify(newConfig, null, 2), 'utf8');

                // Reload config.json
                config = reloadConfig();

                // Reload the config.json file
                function reloadConfig() {
                    const reloadConfigPath = path.join(__dirname, '../config/server.json');
                    delete require.cache[require.resolve(reloadConfigPath)];
                    return require(reloadConfigPath);
                }

                // Log to console
                console.log('Config updated successfully.');
            } catch (error) {
                // Log to console
                console.error('Error updating config:', error);
            }
        }

        // Call the function to update the config
        updateConfig(interaction);

        // If others config is null show old config
        if (ip === null || port === null || password === null || timeout === null) {
            // Create embeds with sendEmbed function
            const embeds = sendEmbed('แจ้งเตือน', `ตั้งค่าเซิร์ฟเวอร์เรียบร้อยแล้ว\nรายละเอียดการตั้งค่า IP: **${config.general.rcon.host}**\nPort: **${config.general.rcon.port}**\nPassword: **${config.general.rcon.password}**\nTimeout: **${config.general.rcon.timeout}**`, '#00ff00', footerText, footerIcon);

            // Reply to user
            await interaction.reply({ embeds: [embeds], ephemeral: true });
        }


    }
}

// Export the module
module.exports = rcon.toJSON();

//    ██╗  ██╗██╗   ██╗███████╗
//    ╚██╗██╔╝╚██╗ ██╔╝╚══███╔╝
//     ╚███╔╝  ╚████╔╝   ███╔╝
//     ██╔██╗   ╚██╔╝   ███╔╝
// ██╗██╔╝ ██╗   ██║   ███████╗
// ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝
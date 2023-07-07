//    ██╗  ██╗██╗   ██╗███████╗
//    ╚██╗██╔╝╚██╗ ██╔╝╚══███╔╝
//     ╚███╔╝  ╚████╔╝   ███╔╝ 
//     ██╔██╗   ╚██╔╝   ███╔╝  
// ██╗██╔╝ ██╗   ██║   ███████╗
// ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝

/*
    This command is used to create a logs channel (in this time)
    Command: /setup create-logs-channel
    Command: /setup create-topup-channel
*/

// Import discord.js module
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

// Import embed.json
const embedConfig = require('../config/embed.json');
const footerImage = embedConfig.general.icon.footerIcon;

// Import sendEmbed function
const { sendEmbed } = require('../functions/sendEmbed.js');

// Import fs ans path
const fs = require('fs');
const path = require('path');

// Create a new SlashCommandBuilder: /setup and can be executed by admins only
const setup = new SlashCommandBuilder()
    .setName('setup')
    .setDescription('ตั้งค่าทั่วไป')

    // Create logs channel: /setup create-logs-channel
    .addSubcommand(subcommand =>
        subcommand
            .setName('create-logs-channel')
            .setDescription('สร้างห้องแจ้งเตือนการเติมเงิน')
    )

    // Create shop channel: /setup create-topup-channel
    .addSubcommand(subcommand =>
        subcommand
            .setName('create-topup-channel')
            .setDescription('สร้างห้องเติมเงิน')
    )

    // Create admin channel: /setup create-admin-channel
    .addSubcommand(subcommand =>
        subcommand
            .setName('create-admin-channel')
            .setDescription('สร้างห้องแจ้งเตือนสำหรับแอดมิน')
    )

    //Admin only can execute this command
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

// reply when the command is executed
setup.execute = async function (interaction) {

    if (interaction.options.getSubcommand() === 'create-logs-channel') {
        // Create a new channel
        const channel = await interaction.guild.channels.create({
            name: '📄︱ꜱʜᴏᴘ-ʟᴏɢꜱ',
            type: ChannelType.GuildText,
            topic: 'ห้องแจ้งเตือนการเติมเงิน',
            permissionOverwrites: [
                {
                    // Only admins can view this channel
                    id: interaction.guild.roles.everyone.id,
                    deny: [PermissionFlagsBits.ViewChannel],
                }
            ],
        });

        // Create embeds with sendEmbed function
        const embeds = sendEmbed('แจ้งเตือน', `สร้างห้องแจ้งเตือนการเติมเงินแล้ว \nห้อง: ${channel}\nChannel Id: ${channel.id}`, '#00ff00', 'SetUp', footerImage);

        // Reply to user
        await interaction.reply({ embeds: [embeds], ephemeral: true });

        // Get the channel id
        const cid = channel.id;

        // Update the config file
        function updateConfig(cid) {
            const discordConfigPath = path.join(__dirname, '../config/discord.json');

            try {
                const data = fs.readFileSync(discordConfigPath, 'utf8');
                const oldConfig = JSON.parse(data);

                const newConfig = {
                    ...oldConfig,
                    general: {
                        ...oldConfig.general,
                        transaction_logs: {
                            ...oldConfig.general.transaction_logs,
                            channelId: cid || oldConfig.general.transaction_logs.channelId,
                        },
                    },
                };

                const serializedConfig = JSON.stringify(newConfig, (key, value) => {
                    if (typeof value === 'bigint') {
                        return value.toString();
                    }
                    return value;
                }, 2);

                fs.writeFileSync(discordConfigPath, serializedConfig, 'utf8');
                console.log('Config updated successfully.');
            } catch (error) {
                console.error('Error updating config:', error);
            }
        }



        // Call the function to update the config
        updateConfig(cid);

    } else if (interaction.options.getSubcommand() === 'create-topup-channel') {
        // Create a new channel
        const channel = await interaction.guild.channels.create({
            name: '💳︱ᴛᴏᴘᴜᴘ-ᴄʜᴀɴɴᴇʟ',
            type: ChannelType.GuildText,
            topic: 'ห้องเติมเงิน',
            permissionOverwrites: [
                {
                    // Only admins can view this channel
                    id: interaction.guild.roles.everyone.id,
                    allow: [PermissionFlagsBits.ViewChannel],
                }
            ],
        });

        // Create embeds with sendEmbed function
        const embeds = sendEmbed('แจ้งเตือน', `สร้างห้องเติมเงินแล้ว \nห้อง: ${channel}\nChannel Id: ${channel.id}`, '#00ff00', 'SetUp', footerImage);

        // Reply to user
        await interaction.reply({ embeds: [embeds], ephemeral: true });

        // Get the channel id
        const cid = channel.id;

        // Update the config file
        function updateConfig(cid) {
            const discordConfigPath = path.join(__dirname, '../config/discord.json');

            try {
                const data = fs.readFileSync(discordConfigPath, 'utf8');
                const oldConfig = JSON.parse(data);

                const newConfig = {
                    ...oldConfig,
                    general: {
                        ...oldConfig.general,
                        topup_channel: {
                            ...oldConfig.general.topup_channel,
                            channelId: cid || oldConfig.general.topup_channel.channelId,
                        },
                    },
                };

                const serializedConfig = JSON.stringify(newConfig, (key, value) => {
                    if (typeof value === 'bigint') {
                        return value.toString();
                    }
                    return value;
                }, 2);

                fs.writeFileSync(discordConfigPath, serializedConfig, 'utf8');
                console.log('Config updated successfully.');
            } catch (error) {
                console.error('Error updating config:', error);
            }
        }



        // Call the function to update the config
        updateConfig(cid);

    } else if (interaction.options.getSubcommand() === 'create-admin-channel') {
        // Create a new channel
        const channel = await interaction.guild.channels.create({
            name: '🔔︱ᴀᴅᴍɪɴ-ʟᴏɢꜱ',
            type: ChannelType.GuildText,
            topic: 'ห้องแจ้งเตือนสำหรับแอดมิน',
            permissionOverwrites: [
                {
                    // Only admins can view this channel
                    id: interaction.guild.roles.everyone.id,
                    deny: [PermissionFlagsBits.ViewChannel],
                }
            ],
        });

        // Create embeds with sendEmbed function
        const embeds = sendEmbed('แจ้งเตือน', `สร้างห้องแจ้งเตือนสำหรับแอดมินแล้ว \nห้อง: ${channel}\nChannel Id: ${channel.id}`, '#00ff00', 'SetUp', footerImage);

        // Reply to user
        await interaction.reply({ embeds: [embeds], ephemeral: true });

        // Get the channel id
        const cid = channel.id;

        // Update the config file
        function updateConfig(cid) {
            const discordConfigPath = path.join(__dirname, '../config/discord.json');

            try {
                const data = fs.readFileSync(discordConfigPath, 'utf8');
                const oldConfig = JSON.parse(data);

                const newConfig = {
                    ...oldConfig,
                    general: {
                        ...oldConfig.general,
                        admin_channel: {
                            ...oldConfig.general.admin_channel,
                            channelId: cid || oldConfig.general.admin_channel.channelId,
                        },
                    },
                };

                const serializedConfig = JSON.stringify(newConfig, (key, value) => {
                    if (typeof value === 'bigint') {
                        return value.toString();
                    }
                    return value;
                }, 2);

                fs.writeFileSync(discordConfigPath, serializedConfig, 'utf8');
                console.log('Config updated successfully.');
            } catch (error) {
                console.error('Error updating config:', error);
            }
        }

        // Call the function to update the config
        updateConfig(cid);
    }
}

// export module
module.exports = setup.toJSON();

//    ██╗  ██╗██╗   ██╗███████╗
//    ╚██╗██╔╝╚██╗ ██╔╝╚══███╔╝
//     ╚███╔╝  ╚████╔╝   ███╔╝
//     ██╔██╗   ╚██╔╝   ███╔╝
// ██╗██╔╝ ██╗   ██║   ███████╗
// ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝
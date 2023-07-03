//    ██╗  ██╗██╗   ██╗███████╗
//    ╚██╗██╔╝╚██╗ ██╔╝╚══███╔╝
//     ╚███╔╝  ╚████╔╝   ███╔╝ 
//     ██╔██╗   ╚██╔╝   ███╔╝  
// ██╗██╔╝ ██╗   ██║   ███████╗
// ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝

/*
    This is huge code, so If you can't understand, you can ask me on discord
    Command: /setting
        Subcommand: /setting truewallet <phone> <rate>
        Subcommand: /setting topup editcondition <target> <amount> <command>
        Subcommand: /setting topup addcondition <amount> <command>
        Subcommand: /setting topup removecondition <target>
        Subcommand: /setting topup listcondition
*/

// Importing modules
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// Import topup.json
const topupJson = require('../config/topup.json');
// let { condition } = topupJson.topup;

// Import embed.json
const embedConfig = require('../config/embed.json');
const footerImage = embedConfig.general.icon.footerIcon;
const footerText = embedConfig.general.footerText;

// Import sendEmbed function
const { sendEmbed } = require('../functions/sendEmbed.js');

// Import reloadConfig function
const { reloadConfig } = require('../functions/clearCache');

// Import fs and path
const fs = require('fs');
const path = require('path');

// Create choices for the condition options
const conditionChoices = Object.entries(topupJson.topup.condition).map(([amount, command]) => ({
    name: amount,
    // value: amount,
}));


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Create a new command: /setting
const setting = new SlashCommandBuilder()
    .setName('setting')
    .setDescription('ตั้งค่าทั่วไป')
    // Add subcommand: /setting truewallet 
    // ตั้งค่า Truewallet: /setting truewallet <phone> <rate>
    .addSubcommand(subcommand =>
        subcommand
            .setName('truewallet')
            .setDescription('ตั้งค่า Truewallet')
            .addStringOption(option =>
                option.setName('phone')
                    .setDescription('เบอร์โทรศัพท์ Truewallet')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('rate')
                    .setDescription('อัตราการเติมเงินต่อ 1 บาท (* เท่าไหร่)')
                    .setRequired(true))
    )

    // Create topup command: /setting topup editcondition <target> <amount> <commad>
    .addSubcommandGroup(subcommandGroup =>
        subcommandGroup
            .setName('topup')
            .setDescription('ตั้งค่าเติมเงิน')
            // Create subcommand: /setting topup editcondition <target> <amount> <commad>
            .addSubcommand(subcommand =>
                subcommand
                    .setName('editcondition')
                    .setDescription('แก้ไขเงื่อนไขการเติมเงิน')
                    .addStringOption(option =>
                        option.setName('target')
                            .setDescription('เงื่อนไขที่ต้องการแก้ไข (ใส่จำนวนเงิน)')
                            .setRequired(true)
                        // .setAutocomplete(true)
                        // .addChoices(...conditionChoices)
                    )
                    .addStringOption(option =>
                        option.setName('amount')
                            .setDescription('เงื่อนไขจำนวนเงินใหม่')
                            .setRequired(true))
                    .addStringOption(option =>
                        option.setName('command')
                            .setDescription('คำสั่งเมื่อเติมเงินถึงเงื่อนไข')
                            .setRequired(true))

            )

            // Create subcommand: /setting topup addcondition <amount> <commad>
            .addSubcommand(subcommand =>
                subcommand
                    .setName('addcondition')
                    .setDescription('เพิ่มเงื่อนไขการเติมเงิน')
                    .addStringOption(option =>
                        option.setName('amount')
                            .setDescription('เงื่อนไขจำนวนเงินใหม่')
                            .setRequired(true))
                    .addStringOption(option =>
                        option.setName('command')
                            .setDescription('คำสั่งเมื่อเติมเงินถึงเงื่อนไข')
                            .setRequired(true))
            )

            // Create subcommand: /setting topup removecondition <amount>
            .addSubcommand(subcommand =>
                subcommand
                    .setName('removecondition')
                    .setDescription('ลบเงื่อนไขการเติมเงิน')
                    .addStringOption(option =>
                        option.setName('target')
                            .setDescription('เงื่อนไขจำนวนเงินที่ต้องการลบ')
                            .setRequired(true)
                        // .setAutocomplete(true)
                        // .addChoices(...conditionChoices)
                    )

            )
            // Create command: /setting topup listcondition
            .addSubcommand(subcommand =>
                subcommand
                    .setName('listcondition')
                    .setDescription('แสดงเงื่อนไขการเติมเงิน')
            )

    )

    // Only admin can use this command
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Reply when admin use /setting
setting.execute = async (interaction) => {

    // Get subcommand name// if the subcommand is "truewallet"
    if (interaction.options.getSubcommand() === 'truewallet') {

        // Get the phone number and rate from the interaction
        const phone = interaction.options.getString('phone');
        const rate = interaction.options.getString('rate');

        // Get voucherConfigPath
        const voucherConfigPath = path.join(__dirname, '../config/topup.json');

        // Function to update the config
        function updateConfig() {
            fs.readFile(voucherConfigPath, 'utf8', (err, data) => {
                if (err) throw err;
                const oldConfig = JSON.parse(data);
                const newConfig = {
                    ...oldConfig,
                    voucher: {
                        phone: phone || oldConfig.voucher.phone,
                        rate: parseInt(rate) || oldConfig.voucher.rate,
                    },
                };
                fs.writeFile(voucherConfigPath, JSON.stringify(newConfig, null, 2), 'utf8', (err) => {
                    if (err) throw err;
                    console.log('Config updated successfully.');
                });
            });
        }

        // Call the function to update the config
        updateConfig(interaction);

        // Create embeds with sendEmbed function
        const embeds = sendEmbed('แจ้งเตือน', `ตั้งค่า Truewallet \nเบอร์โทรศัพท์ **${phone}** \nอัตราการเติมเงิน x **${rate}** บาท`, '#00ff00', footerText, footerImage);

        // Reply to user
        await interaction.reply({ embeds: [embeds], ephemeral: true });

    } else if (interaction.options.getSubcommand() === 'editcondition') {

        // Get the amount and command and target from the interaction
        const target = interaction.options.getString('target');
        const command = interaction.options.getString('command');
        const amount = interaction.options.getString('amount');

        // Function editcondition
        function updateConfig() {
            // Edit the topup.json file

            // Get the path to the config file
            const configPath = path.join(__dirname, '../config/topup.json');

            // Read the config file
            fs.readFile(configPath, 'utf8', (err, data) => {
                if (err) throw err;

                // Parse the config file
                const oldConfig = JSON.parse(data);

                // Check if the target condition exists
                if (!oldConfig.topup.condition.hasOwnProperty(target)) {
                    // Log to the console that the condition does not exist
                    console.log(`Condition for amount ${target} does not exist.`);

                    // Read the config file
                    const data = fs.readFileSync('config/topup.json', 'utf8');
                    const topup = JSON.parse(data);

                    // Loop through the condition and add them to the list
                    const list = [];
                    for (const [key, value] of Object.entries(topup.topup.condition)) {
                        list.push(`- **${key}** บาท \n - คำสั่ง \`${value}\``);
                    }

                    // Create showListCondition with sendEmbed function
                    const showListCondition = sendEmbed('ตรวจสอบเงื่อนไขที่มีอยู่', `เงื่อนไข \n${list.join('\n')}`, '#00ff00', footerText, footerImage);

                    // Create embeds with sendEmbed function
                    const embeds = sendEmbed('แจ้งเตือน', `ไม่พบเงื่อนไขเติมเงิน **${target}** ในระบบ กรุณาตรวจสอบอีกครั้ง\nโปรดใช้คำสั่ง **/setup topup listcondition** เพื่อดูเงื่อนไขทั้งหมดที่มีอยู่ในระบบ`, '#ff0000', footerText, footerImage);

                    // Reply to user
                    interaction.reply({ embeds: [embeds], ephemeral: true });

                    // wait 1 second
                    setTimeout(() => {
                        // Reply to user
                        interaction.followUp({ embeds: [showListCondition], ephemeral: true });
                    }, 1000);

                    // Return means stop the function not continue
                    return;
                }

                // Remove the target condition from the configuration
                const { [target]: removedCondition, ...updatedCondition } = oldConfig.topup.condition;

                // Update the configuration with the new condition
                const newConfig = {
                    ...oldConfig,
                    topup: {
                        ...oldConfig.topup,
                        condition: {
                            ...updatedCondition,
                            [amount]: command
                        }
                    }
                };

                // Write the updated config to the file
                fs.writeFile(configPath, JSON.stringify(newConfig, null, 2), 'utf8', (err) => {
                    // Log to the console if there was an error updating the config
                    if (err) throw err;

                    // Log to the console that the config was updated successfully
                    console.log('Config updated successfully.');

                    // Create embeds with sendEmbed function
                    const embeds = sendEmbed('แจ้งเตือน', `เงื่อนไขการเติมเงิน **${target}** บาท\nเปลี่ยนแปลงเป็น \nจำนวนเงินใหม่ **${amount}** บาท \nคำสั่งใหม่ \`${command}\``, '#00ff00', footerText, footerImage);

                    // Reply to user
                    interaction.reply({ embeds: [embeds], ephemeral: true });

                    // Reload config with reloadConfig function
                    // conditionChoices = reloadConfig('topup.json');
                });
            });
        }
        // Call the function to update the config
        updateConfig(interaction);


    } else if (interaction.options.getSubcommand() === 'removecondition') {

        // Get the amount from the interaction
        const amount = interaction.options.getString('target');

        // Function deletecondition
        function updateConfig() {
            // Edit the topup.json file

            // Get the path to the config file
            const configPath = path.join(__dirname, '../config/topup.json');

            // Read the config file
            fs.readFile(configPath, 'utf8', (err, data) => {
                if (err) throw err;

                // Parse the config file
                const oldConfig = JSON.parse(data);

                // Check if the amount is different from the existing condition key
                if (oldConfig.topup.condition[amount] === undefined) {
                    console.log(`Condition for amount ${amount} not exists.`);
                    // reply to user with embed
                    // Create embeds with sendEmbed function
                    const embeds = sendEmbed('แจ้งเตือน', `ไม่พบเงื่อนไขเติมเงิน **${amount}** ในระบบ กรุณาตรวจสอบอีกครั้ง\nโปรดใช้คำสั่ง **/setting topup listcondition** เพื่อดูเงื่อนไขทั้งหมดที่มีอยู่ในระบบ`, '#ff0000', footerText, footerImage);

                    // Read the config file
                    const data = fs.readFileSync('config/topup.json', 'utf8');
                    const topup = JSON.parse(data);

                    // Loop through the condition and add them to the list
                    const list = [];
                    for (const [key, value] of Object.entries(topup.topup.condition)) {
                        list.push(`- **${key}** บาท \n - คำสั่ง \`${value}\``);
                    }

                    // Create showListCondition with sendEmbed function
                    const showListCondition = sendEmbed('ตรวจสอบเงื่อนไขที่มีอยู่', `เงื่อนไข \n${list.join('\n')}`, '#00ff00', footerText, footerImage);

                    // Reply to user
                    interaction.reply({ embeds: [embeds], ephemeral: true });
                    // wait 1 second
                    setTimeout(() => {
                        // Reply to user
                        interaction.followUp({ embeds: [showListCondition], ephemeral: true });
                    }, 1000);

                    // Return means stop the function not continue
                    return;
                }

                // Remove the target condition from the configuration
                const { [amount]: removedCondition, ...updatedCondition } = oldConfig.topup.condition;

                // Update the configuration with the new condition
                const newConfig = {
                    ...oldConfig,
                    topup: {
                        ...oldConfig.topup,
                        condition: {
                            ...updatedCondition
                        }
                    }
                };

                // Write the updated config to the file
                fs.writeFile(configPath, JSON.stringify(newConfig, null, 2), 'utf8', (err) => {
                    // Log to the console if there was an error updating the config
                    if (err) throw err;

                    // Create embeds with sendEmbed function
                    const embeds = sendEmbed('แจ้งเตือน', `เงื่อนไขการเติมเงิน **${amount}** บาท\nถูกลบออกจากระบบแล้ว`, '#00ff00', footerText, footerImage);

                    // Reply to user
                    interaction.reply({ embeds: [embeds], ephemeral: true });

                    // Log to the console that the config was updated successfully
                    console.log('Config updated successfully.');

                    // Reload config with reloadConfig function
                    // list = reloadConfig('topup.json');
                });
            });
        }

        // Call the function to update the config
        updateConfig(interaction);

    } else if (interaction.options.getSubcommand() === 'addcondition') {
        // Get the amount from the interaction
        const amount = interaction.options.getString('amount');
        // Get the command from the interaction
        const command = interaction.options.getString('command');

        // Function addcondition
        function updateConfig() {
            // Edit the topup.json file

            // Get the path to the config file
            const configPath = path.join(__dirname, '../config/topup.json');

            // Read the config file
            fs.readFile(configPath, 'utf8', (err, data) => {
                if (err) throw err;

                // Parse the config file
                const oldConfig = JSON.parse(data);

                // Check if the amount is different from the existing condition key
                if (oldConfig.topup.condition[amount] !== undefined) {
                    console.log(`Condition for amount ${amount} already exists.`);
                    // reply to user with embed
                    // Create embeds with sendEmbed function
                    const embeds = sendEmbed('แจ้งเตือน', `เงื่อนไขเติมเงิน **${amount}** บาท มีอยู่ในระบบแล้ว กรุณาตรวจสอบอีกครั้ง\nโปรดใช้คำสั่ง **/setting topup listcondition** เพื่อดูเงื่อนไขทั้งหมดที่มีอยู่ในระบบ`, '#ff0000', footerText, footerImage);

                    // Reply to user
                    interaction.reply({ embeds: [embeds], ephemeral: true });
                    // Return means stop the function not continue
                    return;
                }

                // Update the configuration with the new condition
                const newConfig = {
                    ...oldConfig,
                    topup: {
                        ...oldConfig.topup,
                        condition: {
                            ...oldConfig.topup.condition,
                            [amount]: command
                        }
                    }
                };

                // Write the updated config to the file
                fs.writeFile(configPath, JSON.stringify(newConfig, null, 2), 'utf8', (err) => {
                    // Log to the console if there was an error updating the config
                    if (err) throw err;

                    // Create embeds with sendEmbed function
                    const embeds = sendEmbed('แจ้งเตือน', `เพิ่มเงื่อนไขเติมเงิน **${amount}** บาท ในระบบเรียบร้อยแล้ว\nคำสั่ง \`${command}\``, '#00ff00', footerText, footerImage);

                    // Reply to user
                    interaction.reply({ embeds: [embeds], ephemeral: true });

                    // Log to the console that  the config was updated successfully
                    console.log('Config updated successfully.');

                    // Reload config with reloadConfig function
                    // list = reloadConfig('topup.json');
                });
            });
        }

        // Call the function to update the config
        updateConfig(interaction);

    } else if (interaction.options.getSubcommand() === 'listcondition') {
        // show the list of condition
        // Read the config file
        const data = fs.readFileSync('config/topup.json', 'utf8');
        const topup = JSON.parse(data);

        // Loop through the condition and add them to the list
        const list = [];
        for (const [key, value] of Object.entries(topup.topup.condition)) {
            list.push(`- **${key}** บาท \n - คำสั่ง \`${value}\``);
        }

        // Create showListCondition with sendEmbed function
        const showListCondition = sendEmbed('รายการเงื่อนไขการเติมเงิน', `เงื่อนไข \n${list.join('\n')}`, '#00ff00', footerText, footerImage);

        // Reply to user
        await interaction.reply({ embeds: [showListCondition], ephemeral: true });

    } else if (interaction.options.getSubcommand() === 'reloadconfig') {
        // Reload config with reloadConfig function
        topupJson.topup.condition = reloadConfig('topup.json');

        // Create embeds with sendEmbed function
        const embeds = sendEmbed('แจ้งเตือน', `Reload Config สำเร็จแล้ว`, '#00ff00', footerTextw, footerImage);

        // Reply to user
        await interaction.reply({ embeds: [embeds], ephemeral: true });

    }


}

// Export the module
module.exports = setting.toJSON();

//    ██╗  ██╗██╗   ██╗███████╗
//    ╚██╗██╔╝╚██╗ ██╔╝╚══███╔╝
//     ╚███╔╝  ╚████╔╝   ███╔╝
//     ██╔██╗   ╚██╔╝   ███╔╝
// ██╗██╔╝ ██╗   ██║   ███████╗
// ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝
//    ██╗  ██╗██╗   ██╗███████╗
//    ╚██╗██╔╝╚██╗ ██╔╝╚══███╔╝
//     ╚███╔╝  ╚████╔╝   ███╔╝ 
//     ██╔██╗   ╚██╔╝   ███╔╝  
// ██╗██╔╝ ██╗   ██║   ███████╗
// ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝

// declare global variables
let host;
let port;
let password;


// Import rcon
const { Rcon } = require('minecraft-rcon-client');

// Import reloadConfig function
const { reloadConfig } = require('../functions/clearCache');

async function sendTopupCommands(topupCondition, amount, username, rate) {

    // clear cache before use
    delete require.cache[require.resolve('../config/server.json')];
    delete require.cache[require.resolve('../config/topup.json')];

    // Import config
    const config = require('../config/server.json');
    const topupConfig = require('../config/topup.json');

    const topupDebug = topupConfig.command.enabled;

    port = config.general.rcon.port;
    host = config.general.rcon.host;
    password = config.general.rcon.password;

    // Create a new RCON client
    client = new Rcon({ // all of those are required!
        port: port,
        host: host,
        password: password
    })

    // calculate the amount of money the player will receive
    const topupAmount = amount * rate;

    // Get all eligible conditions for the given amount
    const amounts = Object.keys(topupCondition).map(Number); // create an array of all available condition values
    const eligibleConditions = amounts.filter(value => value <= topupAmount).sort((a, b) => b - a);

    // flag to check if any commands were sent
    let commandSent = false;

    // Send each eligible command to RCON
    await client.connect().catch((err) => {

        // Log error if connection failed (error)
        console.log(`${err}`);
    });

    // Loop through all eligible conditions
    for (const currentAmount of eligibleConditions) {

        // Get the command for the current amount and replace %player% with the given username and replace %amount% with the calculated amount
        const command = topupCondition[currentAmount].replace('%player%', username).replace('%amount%', topupAmount);

        /*
        ██╗███╗   ███╗██████╗  ██████╗ ██████╗ ████████╗ █████╗ ███╗   ██╗████████╗
        ██║████╗ ████║██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔══██╗████╗  ██║╚══██╔══╝
        ██║██╔████╔██║██████╔╝██║   ██║██████╔╝   ██║   ███████║██╔██╗ ██║   ██║   
        ██║██║╚██╔╝██║██╔═══╝ ██║   ██║██╔══██╗   ██║   ██╔══██║██║╚██╗██║   ██║   
        ██║██║ ╚═╝ ██║██║     ╚██████╔╝██║  ██║   ██║   ██║  ██║██║ ╚████║   ██║   
        ╚═╝╚═╝     ╚═╝╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝
        */

        // Send the command to RCON
        await client.send(command).then((response) => {

            // Log success if command was sent successfully
            console.log(`Command "${command}" sent successfully: ${response}`);

            // Set flag to true if command was sent successfully
            commandSent = true;
        }).catch((err) => {

            // Log error if command failed to send
            console.log(`An error occurred while sending command "${command}"`);
        });
    }

    /*
    ██████╗ ███████╗███████╗ █████╗ ██╗   ██╗██╗  ████████╗
    ██╔══██╗██╔════╝██╔════╝██╔══██╗██║   ██║██║  ╚══██╔══╝
    ██║  ██║█████╗  █████╗  ███████║██║   ██║██║     ██║   
    ██║  ██║██╔══╝  ██╔══╝  ██╔══██║██║   ██║██║     ██║   
    ██████╔╝███████╗██║     ██║  ██║╚██████╔╝███████╗██║   
    ╚═════╝ ╚══════╝╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝   
    */

    // Send the default command if no commands were sent
    if (!commandSent) { // If no commands were sent, send the default command

        // Get the default command and replace %player% with the given username and replace %amount% with the calculated amount
        const defaultCommand = topupCondition["default"].replace('%player%', username).replace('%amount%', topupAmount);

        // Send the default command to RCON
        await client.send(defaultCommand).then((response) => {
            // Log success if command was sent successfully
            console.log(`Command "${defaultCommand}" sent successfully: ${response}`);
        }).catch((err) => {

            // Log error if command failed to send
            console.log(`An error occurred while sending command "${defaultCommand}"`);
            return;
        });

    }

    // Send command when player topup fails (if enabled) and replace %player% with the given username and replace %amount% with the calculated amount
    const successCommand = topupConfig.command.when_player_topup_success.replace('%player%', username).replace('%amount%', topupAmount);
    if (topupDebug === true) {
        await client.send(successCommand).then((response) => {
            // Log success if command was sent successfully
            console.log(`Command "${successCommand}" sent successfully: ${response}`);
        }
        ).catch((err) => {
            // Log error if command failed to send
            console.log(`An error occurred while sending command "${successCommand}"`);
        }
        );
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    ██████╗ ███████╗██████╗ ██╗   ██╗ ██████╗ 
    ██╔══██╗██╔════╝██╔══██╗██║   ██║██╔════╝ 
    ██║  ██║█████╗  ██████╔╝██║   ██║██║  ███╗
    ██║  ██║██╔══╝  ██╔══██╗██║   ██║██║   ██║
    ██████╔╝███████╗██████╔╝╚██████╔╝╚██████╔╝
    ╚═════╝ ╚══════╝╚═════╝  ╚═════╝  ╚═════╝
    */

    /*
        The following code will be executed if the player topup fails (เติมเงินไม่สำเร็จ)
        Command: you can set the command to be executed when the player topup fails in the config file
        Like:
        📁 /config/topup.json
        "command": {
            "enabled": true,
            "when_player_topup_fail": "say %player% topup %amount% failed"
        }
    */

    // Debug mode

    // Send command when player topup fails
    const failCommand = topupConfig.command.when_player_topup_fail.replace('%player%', username).replace('%amount%', topupAmount);
    if (topupDebug === true) {
        await client.send(failCommand).then((response) => {
            // Log success if command was sent successfully
            console.log(`Command "${failCommand}" sent successfully: ${response}`);
        }
        ).catch((err) => {
            // Log error if command failed to send
            console.log(`An error occurred while sending command "${failCommand}"`);
        }
        );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Disconnect from RCON
    client.disconnect();

}

// Export this function to use in other file
module.exports = { sendTopupCommands, reloadConfig }

//    ██╗  ██╗██╗   ██╗███████╗
//    ╚██╗██╔╝╚██╗ ██╔╝╚══███╔╝
//     ╚███╔╝  ╚████╔╝   ███╔╝
//     ██╔██╗   ╚██╔╝   ███╔╝
// ██╗██╔╝ ██╗   ██║   ███████╗
// ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝
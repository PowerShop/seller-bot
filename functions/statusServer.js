// Request type: GET
// API: https://api.mcstatus.io/v2/status/java/<address>

const fetch = require('node-fetch');

// Import the server.json file
// Clear cache


// Request API to get the server status
async function getServerStatus(address) {
    const response = await fetch(`https://api.mcstatus.io/v2/status/java/${address}`);
    const serverStatus = await response.json();
    const isOnline = serverStatus.online;
    return isOnline;
}

// Export the isOnline function
module.exports = async function isOnline() {
    delete require.cache[require.resolve('../config/server.json')];
    const serverConfig = require('../config/server.json');
    
    const serverAddress = serverConfig.general.rcon.host;
    const online = await getServerStatus(serverAddress);
    return online;
};

/*
██████╗██╗     ███████╗ █████╗ ██████╗      ██████╗ █████╗  ██████╗██╗  ██╗███████╗
██╔════╝██║     ██╔════╝██╔══██╗██╔══██╗    ██╔════╝██╔══██╗██╔════╝██║  ██║██╔════╝
██║     ██║     █████╗  ███████║██████╔╝    ██║     ███████║██║     ███████║█████╗  
██║     ██║     ██╔══╝  ██╔══██║██╔══██╗    ██║     ██╔══██║██║     ██╔══██║██╔══╝  
╚██████╗███████╗███████╗██║  ██║██║  ██║    ╚██████╗██║  ██║╚██████╗██║  ██║███████╗
 ╚═════╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝     ╚═════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝
*/

/*
    * Never used, but I'm keeping it here for future reference
*/

// Import path module
const path = require('path');

// Clear cache (reload config)
function reloadConfig(file) {
    const reloadConfigPath = path.join(__dirname, `../config/${file}.json`);

    if (require.cache[require.resolve(reloadConfigPath)]) {
        delete require.cache[require.resolve(reloadConfigPath)];
    }

    return require(reloadConfigPath);
}


// Export the reloadConfig function
module.exports = { reloadConfig };



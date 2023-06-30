/*
██████╗██╗     ███████╗ █████╗ ██████╗      ██████╗ █████╗  ██████╗██╗  ██╗███████╗
██╔════╝██║     ██╔════╝██╔══██╗██╔══██╗    ██╔════╝██╔══██╗██╔════╝██║  ██║██╔════╝
██║     ██║     █████╗  ███████║██████╔╝    ██║     ███████║██║     ███████║█████╗  
██║     ██║     ██╔══╝  ██╔══██║██╔══██╗    ██║     ██╔══██║██║     ██╔══██║██╔══╝  
╚██████╗███████╗███████╗██║  ██║██║  ██║    ╚██████╗██║  ██║╚██████╗██║  ██║███████╗
 ╚═════╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝     ╚═════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝
*/

// Clear cache (reload config)
function reloadConfig(file) {
    // Delete the cache entry for the specified file
    delete require.cache[require.resolve(`../config/${file}`)];

    // Require the file again, which will reload it
    return require(`../config/${file}`);
}

// Export the reloadConfig function
module.exports = { reloadConfig };



// Delete the welcome message from the channel
const deleteWelcomeMessage = async (client, channelId) => {
    const channel = await client.channels.cache.get(channelId);
    const messages = await channel.messages.fetch({ limit: 1 });
    const botMessages = messages.filter(m => m.author.id === client.user.id);

    // Check if there are any bot messages
    if (botMessages.size > 0) {
        await channel.bulkDelete(botMessages);
        console.log('Welcome message deleted.');
    } else {
        console.log('No welcome message found.');
    }
}

// Export the function
module.exports = { deleteWelcomeMessage };


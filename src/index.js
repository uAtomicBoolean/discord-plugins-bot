const { Client, GatewayIntentBits } = require('discord.js');
const { PluginsManager } = require('./lib/plugins_manager');
const { token, devGuildId } = require(`${process.cwd()}/config.json`);

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildBans,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.MessageContent,
	],
});

client.pm = new PluginsManager(client);

(async () => {
	await client.pm.start(token);
	if (process.argv.includes('-L')) {
		await client.pm.uploadCommands();
	}
	else if (process.argv.includes('-l')) {
		await client.pm.uploadCommands(devGuildId);
	}
})();

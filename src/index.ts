import { GatewayIntentBits } from 'discord.js';
import { PluginsManager } from './lib/plugins_manager';
import { token, devGuildId } from './config.json';
import { Bot } from './lib/bot';


const client = new Bot({
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

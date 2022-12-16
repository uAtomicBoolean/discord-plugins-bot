import { Collection } from "discord.js";
import { pluginsPath } from '../config.json';
import { Bot } from "./bot";
import fs from 'fs';


/**
 * Class managing the client's plugins.
 * This class also offers a logging system.
 */
export class PluginsManager {
	public client: Bot;
	private log_levels: Array<string>;
	
	/**
	 * Class constructor.
	 * @param client The bot's client.
	 */
	constructor(client: Bot) {
		this.client = client;
		this.log_levels = ['INFO', 'WARNING'];
	}

	/**
	 * Starts the client with logging.
	 * @param token The client's token.
	 */
	async start(clientToken: string) {
		this.log('Bot starting up.');
		await this.client.login(clientToken);
	}

	/**
	 * Affiche le log si le logging est activé.
	 * @param text The log message.
	 * @param level Optional (0 = default). The log level (INFO = 0, WARNING = 1).
	 */
	log(text: string, level: number = 0) {
		const date = new Date();
		const dateFormat = `${date.getFullYear()}-${date.getMonth()}-${date.getDay()} `
			+ `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
		console.log(`${dateFormat} ${this.log_levels[level]} : ${text}`);
	}

	/**
	 * Loads the plugins in the client.
	 */
	loadPlugins() {
		const plugins = fs.readdirSync(pluginsPath, { withFileTypes: true })
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name);

		this.log(`${plugins.length} plugins found !`);
		let nb_plugins_charges = 0;

		for (const plugin of plugins) {
			this.log(`Loading the plugin '${plugin}'`);

			const folders = fs.readdirSync(`${pluginsPath}/${plugin}`, { withFileTypes: true })
				.filter(dirent => dirent.isDirectory() || dirent.name === 'plugin.json')
				.map(dirent => dirent.name);

			if (folders.includes('plugin.js')) {
				const plug_conf = require(`${process.cwd()}/${pluginsPath}/${plugin}/plugin.js`);
				if ('enabled' in plug_conf && !plug_conf.enabled) {
					continue;
				}
				// Executing the plugin's initialization function.
				if ('init' in plug_conf) {
					plug_conf.init(this.client).then();
				}
			}

			if (folders.includes('commands')) { this.loadCommands(plugin); }
			if (folders.includes('events')) { this.loadEvents(plugin); }
			nb_plugins_charges++;
		}

		this.log(`${nb_plugins_charges} plugins loaded !`);
	}

	/**
	 * Loads the commands in the client.
	 * @param plugin The plugin's name.
	 */
	loadCommands(plugin: string) {
		const commandsPath = `${process.cwd()}/${pluginsPath}/${plugin}/commands`;
		const commands = fs.readdirSync(commandsPath, { withFileTypes: true })
			.filter(filent => filent.isFile())
			.map(filent => filent.name);

		for (const command of commands) {
			this.log(`Loading the command '${plugin}-${command}'.`);
			const data = require(`${commandsPath}/${command}`);
			this.client.commands.set(data.data.name, data);
		}
	}

	/**
	 * Loads the events in the client.
	 * @param plugin The plugin's name.
	 */
	loadEvents(plugin: string) {
		const eventsPath = `${process.cwd()}/${pluginsPath}/${plugin}/events`;
		const events = fs.readdirSync(eventsPath, { withFileTypes: true })
			.filter(filent => filent.isFile())
			.map(filent => filent.name);

		for (const event of events) {
			this.log(`Loading the event '${plugin}-${event}'.`);

			const data = require(`${eventsPath}/${event}`);
			const data_exc = async (...args: any[]) => { await data.execute(...args, this.client); };
			if (data.once) {
				this.client.once(data.name, data_exc);
			}
			else {
				this.client.on(data.name, data_exc);
			}
		}
	}

	/**
	 * Upload the commands either in a specified guild or in all the client's guilds.
	 * @param guildId Optional. The Id of the guild that will receive the commands.
	 */
	async uploadCommands(guildId: string | null = null) {
		const commands: Array<any> = [];
		this.client.commands.map((command: any) => {
			commands.push(command.data.toJSON());
		});

		this.log('The commands will be uploaded ' + (guildId
			? `in the guild ${guildId}.`
			: 'in all the guilds.'
		));
		this.log(`Started refreshing ${commands.length} application (/) commands !`);

		if (guildId) {
			await this._uploadCommandsToGuild(guildId, commands);
		}
		else {
			await this.client.application?.commands.set(commands);
			this.client.guilds.cache.forEach(async (value, key) => {
				await this._uploadCommandsToGuild(key, commands);
			});
		}

		this.log('Successfully reloaded application (/) commands !');
	}

	/**
	 * Upload the commands passed as parameter to the specified guild.
	 * This function is private and should not be called by the user.
	 * @param guildId The guild's id.
	 * @param commands The commands list.
	 */
	async _uploadCommandsToGuild(guildId: string, commands: any[]) {
		const guild = await this.client.guilds.fetch(guildId);
		guild.commands.set(commands);
	}
}

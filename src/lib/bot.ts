import {
	Client,
	ClientOptions,
	Collection,
	ApplicationCommandDataResolvable } from 'discord.js';
import { commandsArray } from '@lib/types';
import { green, red, yellow } from 'ansicolor';
import fs from 'fs';


const LOG_LEVELS = ['INFO', 'WARNING', 'ERROR'];


export class Bot extends Client {
	public commands: commandsArray;
	private readonly _pluginsPath: string;

	constructor(options: ClientOptions) {
		super(options);
		this.commands = new Collection();

		// This variable is necessary to load the plugins from dist and
		// not src (and the opposite) when running the code after compilation.
		this._pluginsPath = `${__dirname}/../plugins`;

		this.loadPlugins();
	}

	/**
	 * Start the bot and log the start.
	 * @param token The bot's token.
	 */
	async start(token: string) {
		this.log('Bot starting up.');
		await super.login(token);
	}

	/* ----------------------------------------------- */
	/* LOGGING                                         */
	/* ----------------------------------------------- */
	/**
	 * Get the colored text for the log's level.
	 * @param level The log's level.
	 * @returns A colored string.
	 */
	_getLevelTxt(level: number): string {
		switch (level) {
		case 0:
			return green(LOG_LEVELS[level]);
		case 1:
			return yellow(LOG_LEVELS[level]);
		case 2:
			return red(LOG_LEVELS[level]);
		default:
			return 'UNKNOWN';
		}
	}

	/**
	 * Display a log.
	 * @param text The log message.
	 * @param level The log level.
	 */
	log(text: string, level: number = 0) {
		const date = new Date();
		const dateFormat = `${date.getFullYear()}-${date.getMonth()}-${date.getDay()} `
			+ `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
		console.log(`${dateFormat} ${this._getLevelTxt(level)} : ${text}`);
	}

	/**
	 * Display a log but specificaly for an error in a command.
	 * @param cmd_name The command's name.
	 * @param error The error.
	 */
	logErrCommande(cmd_name: string, error: unknown) {
		this.log(`An error occured in the "${cmd_name}" command !`, 2);
        console.log(error);
	}

	/* ----------------------------------------------- */
	/* PLUGINS                                         */
	/* ----------------------------------------------- */
	/**
	 * Load the plugins in the bot.
	 */
	loadPlugins() {
		const plugins = fs.readdirSync(this._pluginsPath, { withFileTypes: true })
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name);

		this.log(`${plugins.length} plugins found !`);
		let nb_plugins_charges = 0;

		for (const plugin of plugins) {
			this.log(`Loading the plugin '${plugin}'.`);

			const folders = fs.readdirSync(`${this._pluginsPath}/${plugin}`, { withFileTypes: true })
				.filter(dirent => dirent.isDirectory() || dirent.name === 'init.ts')
				.map(dirent => dirent.name);

			if (folders.includes('init.ts')) {
				const plug_conf = require(`${this._pluginsPath}/${plugin}/init.ts`);
				if ('enabled' in plug_conf && !plug_conf.enabled) {
					this.log('Plugin ignored as it is disabled (init.ts) !', 1);
					continue;
				}
				if ('init' in plug_conf) {
					plug_conf.init(this);
				}
			}

			if (folders.includes('commands')) { this.loadCommands(plugin); }
			if (folders.includes('events')) { this.loadEvents(plugin); }
			nb_plugins_charges++;
		}

		this.log(`${nb_plugins_charges} plugins loaded !`);
	}

	/**
	 * Load a plugin's commands in the bot.
	 * @param plugin The plugin's name.
	 */
	loadCommands(plugin: string) {
		const commandsPath = `${this._pluginsPath}/${plugin}/commands`;
		// Removing the '.map' files from the resulting list to avoid a runtime error.
		// The map files are used by the Typescript debugger.
		const commands = fs.readdirSync(commandsPath, { withFileTypes: true })
			.filter(filent => filent.isFile() && !filent.name.endsWith('.map'))
			.map(filent => filent.name);

		for (const command of commands) {
			this.log(`\t command: ${command}`);
			const data = require(`${commandsPath}/${command}`);
			this.commands.set(data.data.name, data);
		}
	}

	/**
	 * Load a plugin's events in the bot.
	 * @param plugin The plugin's name.
	 */
	loadEvents(plugin: string) {
		const eventsPath = `${this._pluginsPath}/${plugin}/events`;
		const events = fs.readdirSync(eventsPath, { withFileTypes: true })
			.filter(filent => filent.isFile() && !filent.name.endsWith('.map'))
			.map(filent => filent.name);

		for (const event of events) {
			this.log(`\t event: ${event}`);

			const data = require(`${eventsPath}/${event}`);
			const data_exc = async (...args: any[]) => { await data.execute(...args, this); };

			if (data.once) {
				this.once(data.name, data_exc);
			}
			else {
				this.on(data.name, data_exc);
			}
		}
	}

	/**
	 * Upload the commands in either the specified guild, or in all the guilds if no
	 * id is passed.
	 * @param guildId [Optional] The guild's id if the commands needs to be only
	 * upload in one guild.
	 */
	async uploadCommands(guildId: string | null = null) {
		const commands: ApplicationCommandDataResolvable[] = [];
		this.commands.map(command => {
			commands.push(command.data.toJSON());
		});

		this.log('The commands will be loaded in ' + (guildId
			? `the guild '${guildId}'.`
			: 'all the guilds.'
		));
		this.log(`Starting refreshing ${commands.length} application (/) commands !`);

		if (guildId) {
			await this._uploadCommandsToGuild(guildId, commands);
		}
		else {
			await this.application?.commands.set(commands);
			this.guilds.cache.forEach(async (value, key) => {
				await this._uploadCommandsToGuild(key, commands);
			});
		}

		this.log(`Successfully reloaded ${commands.length} application (/) commands !`);
	}

	/**
	 * Upload the commands passed as parameters in a guild.
	 * This function is used by the 'uploadCommands' function.
	 * @param guildId The id of the targeted guild.
	 * @param commands The commands' list.
	 */
	private async _uploadCommandsToGuild(guildId: string, commands: any[]) {
		const guild = await this.guilds.fetch(guildId);
		await guild.commands.set(commands);
	}
}
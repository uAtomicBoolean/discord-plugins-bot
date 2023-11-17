import { commandsArray, discordId } from '@lib/types';
import {
	ApplicationCommandDataResolvable,
	Client,
	ClientOptions,
	Collection,
	REST,
	Routes,
} from 'discord.js';
import fs from 'fs';
import pino from 'pino';
import { CHECK_INTERACTION_CREATE_HANDLER, PLUGINS_PATH } from './config';

const NodeCache = require('node-cache');


export class Bot extends Client {
	// Array used to store the commands and their handlers.
	public commands: commandsArray;

	// A simple cache useful to store temporary data.
	// It is configured to store the data for 1 day before deleting them.
	public readonly cache: typeof NodeCache;

	public readonly logger = pino({
		transport: {
			target: 'pino-pretty',
		},
	});

	constructor(options: ClientOptions) {
		super(options);
		this.commands = new Collection();
		this.cache = new NodeCache({ stdTTL: 86400 });

		this.loadPlugins();
	}

	/**
	 * Start the bot with a log.
	 */
	async start() {
		this.logger.info('Bot starting up.');
		await super.login(process.env.TOKEN);
	}

	/* ----------------------------------------------- */
	/* PLUGINS                                         */
	/* ----------------------------------------------- */
	/**
	 * Load the plugins in the bot.
	 */
	loadPlugins() {
		const plugins = fs.readdirSync(PLUGINS_PATH, { withFileTypes: true })
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name);

		this.logger.info(`${plugins.length} plugins found !`);
		let countPluginsLoaded = 0;

		for (const plugin of plugins) {
			this.logger.info(`Loading the plugin '${plugin}'.`);

			const folders = fs.readdirSync(`${PLUGINS_PATH}/${plugin}`, { withFileTypes: true })
				.filter(dirent => dirent.isDirectory() || dirent.name === 'init.ts')
				.map(dirent => dirent.name);

			if (folders.includes('init.ts')) {
				const plugConf = require(`${PLUGINS_PATH}/${plugin}/init.ts`);
				if ('enabled' in plugConf && !plugConf.enabled) {
					this.logger.warn('Plugin ignored as it is disabled (init.ts) !');
					continue;
				}
				if ('init' in plugConf) {
					plugConf.init(this);
				}
			}

			if (folders.includes('commands')) { this.loadCommands(plugin); }
			if (folders.includes('events')) { this.loadEvents(plugin); }
			countPluginsLoaded++;
		}

		this.logger.info(`${countPluginsLoaded} plugins loaded !`);
	}

	/**
	 * Load a plugin's commands in the bot.
	 * @param plugin The plugin's name.
	 */
	loadCommands(plugin: string) {
		const commandsPath = `${PLUGINS_PATH}/${plugin}/commands`;
		const commands = fs.readdirSync(commandsPath, { withFileTypes: true })
			.filter(filent => filent.isFile() && !filent.name.endsWith('.map'))
			.map(filent => filent.name);

		for (const command of commands) {
			this.logger.info(`\t command: ${command}`);
			const data = require(`${commandsPath}/${command}`);
			this.commands.set(data.command.name, data);
		}
	}

	/**
	 * Load a plugin's events in the bot.
	 * @param plugin The plugin's name.
	 */
	loadEvents(plugin: string) {
		const eventsPath = `${PLUGINS_PATH}/${plugin}/events`;
		const events = fs.readdirSync(eventsPath, { withFileTypes: true })
			.filter(filent => filent.isFile() && !filent.name.endsWith('.map'))
			.map(filent => filent.name);

		for (const event of events) {
			this.logger.info(`\t event: ${event}`);

			const data = require(`${eventsPath}/${event}`);
			if (CHECK_INTERACTION_CREATE_HANDLER && plugin !== 'base' && data.name === 'interactionCreate') {
				this.logger.error('You cannot create a handler for the "interactionCreate" event as one already ' +
					'exists in the "base" plugin.');
				process.exit(1);
			}

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
	 * Upload the commands to either a specific guild or all the guilds.
	 * @param targetGuildId The guild's id to upload the commands to.
	 */
	async uploadCommands(targetGuildId?: discordId) {
		this.logger.info('The commands will be refreshed in ' + (targetGuildId
			? `the guild '${targetGuildId}'.`
			: 'all the guilds.'
		));

		const commands: ApplicationCommandDataResolvable[] = [];
		this.commands.map(data => {
			commands.push(data.command.toJSON());
			this.logger.info(`Loading the commmand: ${data.command.toJSON().name}`);
		});

		const rest = new REST({ version: '10' }).setToken(this.token);

		this.logger.info(`Started refreshing ${this.commands.size} application (/) commands!`);
		try {
			if (targetGuildId) {
				await rest.put(
					Routes.applicationGuildCommands(this.user.id, targetGuildId),
					{ body: commands },
				);
			}
			else {
				await rest.put(
					Routes.applicationCommands(this.user.id),
					{ body: commands },
				);
				this.logger.info('The commands may take up to an hour before being available in all the guilds.');
			}

			this.logger.info(`Finished refreshing ${this.commands.size} application (/) commands!`);
		}
		catch (error) {
			this.logger.error('An error occured while refreshing the application (/) commands!');
			console.error(error);
		}
	}
}

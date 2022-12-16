import { Client, ClientOptions, Collection, SlashCommandBuilder } from 'discord.js';
import { PluginsManager } from './plugins_manager';

type commandsAr = Collection<string, { data: SlashCommandBuilder, execute: Function}>;

export class Bot extends Client {
	public pm: PluginsManager;
	public commands: commandsAr;

	constructor(options: ClientOptions) {
		super(options);
		this.pm = new PluginsManager(this);
		this.commands = new Collection();

		this.pm.loadPlugins();
	}
}
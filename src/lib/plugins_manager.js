const { pluginsPath } = require(`${process.cwd()}/config.json`);
const { Collection } = require('discord.js');
const fs = require('fs');

/**
 * Class gérant les plugins du bot.
 * Cette classe propose aussi un système de logging pour le client.
 */
class PluginsManager {
	/**
	 * Constructeur de la class.
	 * @param {Client} client Le client du bot.
	 * @param {object} options Un objet contenant des options altérant le comportement
	 * du plugins manager.
	 */
	constructor(client, options = {}) {
		this.client = client;
		this.client.commands = new Collection();
		this.options = options;

		this.log_enabled = 'verbose' in this.options && this.options.verbose;
		this.log_levels = ['INFO', 'WARNING'];

		this.loadPlugins();
	}

	/**
	 * Démarre le bot.
	 * @param {string} token Le token du bot.
	 */
	async start(clientToken) {
		this.log('Démarrage du bot.');
		await this.client.login(clientToken);
	}

	/**
	 * Affiche le log si le logging est activé.
	 * @param {string} text Le message de log.
	 * @param {number} level Optionnel (0 = défaut). Le niveau de log (INFO = 0, WARNING = 1).
	 */
	log(text, level = 0) {
		if (this.log_enabled) {
			const date = new Date();
			const dateFormat = `${date.getFullYear()}-${date.getMonth()}-${date.getDay()} `
				+ `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
			console.log(`${dateFormat} ${this.log_levels[level]} : ${text}`);
		}
	}

	/**
	 * Charge les plugins dans le bot.
	 */
	loadPlugins() {
		const plugins = fs.readdirSync(pluginsPath, { withFileTypes: true })
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name);

		this.log(`${plugins.length} plugin(s) trouvé(s) !`);
		let nb_plugins_charges = 0;

		for (const plugin of plugins) {
			this.log(`Chargement du plugin ${plugin}`);

			const folders = fs.readdirSync(`${pluginsPath}/${plugin}`, { withFileTypes: true })
				.filter(dirent => dirent.isDirectory() || dirent.name === 'plugin.json')
				.map(dirent => dirent.name);

			if (folders.includes('plugin.json')) {
				const plug_conf = require(`${process.cwd()}/${pluginsPath}/${plugin}/plugin.json`);
				if ('enabled' in plug_conf && !plug_conf.enabled) {
					this.log('Plugin ignoré car désactivé (plugin.json) !');
					continue;
				}
			}

			if (folders.includes('commands')) { this.loadCommands(plugin); }
			if (folders.includes('events')) { this.loadEvents(plugin); }
			nb_plugins_charges++;
		}

		this.log(`${nb_plugins_charges} plugin(s) chargé(s) !`);
	}

	/**
	 * Charge les commandes d'un plugin dans le bot.
	 * @param {string} plugin Le nom du plugin.
	 */
	loadCommands(plugin) {
		const commandsPath = `${process.cwd()}/${pluginsPath}/${plugin}/commands`;
		const commands = fs.readdirSync(commandsPath, { withFileTypes: true })
			.filter(filent => filent.isFile())
			.map(filent => filent.name);

		for (const command of commands) {
			this.log(`Chargement de la commande '${plugin}-${command}'.`);
			const data = require(`${commandsPath}/${command}`);
			this.client.commands.set(data.data.name, data);
		}
	}

	/**
	 * Charge les évènements d'un plugin dans le bot.
	 * @param {string} plugin Le nom du plugin.
	 */
	loadEvents(plugin) {
		const eventsPath = `${process.cwd()}/${pluginsPath}/${plugin}/events`;
		const events = fs.readdirSync(eventsPath, { withFileTypes: true })
			.filter(filent => filent.isFile())
			.map(filent => filent.name);

		for (const event of events) {
			this.log(`Chargement de l'évènement '${plugin}-${event}'.`);

			const data = require(`${eventsPath}/${event}`);
			const data_exc = async (...args) => { await data.execute(...args, this.client); };

			if (data.once) {
				this.client.once(data.name, data_exc);
			}
			else {
				this.client.on(data.name, data_exc);
			}
		}
	}

	/**
	 * Upload les commandes, soit dans une guild spécifiée, soit dans toutes les guilds
	 * du bot.
	 * @param {string} guildId Optionel. L'identifiant de la guild si les commandes doivent
	 * être uploadées dans une seul guild.
	 */
	async uploadCommands(guildId = null) {
		const commands = [];
		this.client.commands.map(command => {
			commands.push(command.data.toJSON());
		});

		this.log('Les commandes vont être chargées dans ' + (guildId
			? `la guild ${guildId}.`
			: 'toutes les guilds.'
		));
		this.log(`Début de la mise à jour de ${commands.length} application (/) commands !`);

		if (guildId) {
			await this._uploadCommandsToGuild(guildId, commands);
		}
		else {
			await this.client.application.commands.set(commands);
			this.client.guilds.cache.forEach(async (value, key) => {
				await this._uploadCommandsToGuild(key, commands);
			});
		}

		this.log('Fin de la mise à jour des application (/) commands !');
	}

	/**
	 * Upload les commandes passées en paramètre dans une guild.
	 * Cette fonction est privée et n'a donc pas à être appelée par
	 * l'utilisateur.
	 * @param {string} guildId l'identifiant de la guild ciblée.
	 * @param {array} commands Une liste contenant les commandes à uploader dans la guild.
	 */
	async _uploadCommandsToGuild(guildId, commands) {
		const guild = await this.client.guilds.fetch(guildId);
		guild.commands.set(commands);
	}
}


module.exports = {
	PluginsManager,
};

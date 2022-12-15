/**
 * @author uAtomicBoolean
 * @description
 *      La commande permettant de gérer les modules (activation/désactivation).
 */

const { CommandInteraction, SlashCommandBuilder } = require('discord.js');


/* ----------------------------------------------- */
/* COMMAND BUILD                                   */
/* ----------------------------------------------- */
const slashCommand = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('[misc] Pong !');


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Handler pour la SlashCommande.
 * @param {CommandInteraction} interaction L'interaction générée par l'exécution de la commande.
 */
async function execute(interaction) {
	await interaction.reply('Pong !');
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	data: slashCommand,
	execute,
};

/**
 * @author uAtomicBoolean
 * @description The handler for the 'interactionCreate' event.
 */

import { CommandInteraction } from 'discord.js';
import { Bot } from 'src/lib/bot';


/**
* Handler for the event.
*/
export async function execute(interaction: CommandInteraction, client: Bot) {
	if (interaction.isCommand()) {
		await client.commands.get(interaction.commandName)?.execute(interaction, client);
	}
}


export const name = 'interactionCreate';

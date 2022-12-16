/**
 * @author uAtomicBoolean
 */

 import { CommandInteraction } from "discord.js";
import { Bot } from "src/lib/bot";


 /* ----------------------------------------------- */
 /* FUNCTIONS                                       */
 /* ----------------------------------------------- */
 /**
  * Handler for the event.
  */
 export async function execute(interaction: CommandInteraction, client: Bot) {
	if (interaction.isCommand()) {
		console.log(client.commands)
		const command = client.commands.get(interaction.commandName);
		console.log(interaction.commandName, command)
		await command!.execute(interaction);
	}
 }
 
 
 /* ----------------------------------------------- */
 /* MODULE EXPORTS                                  */
 /* ----------------------------------------------- */
 export const name = 'interactionCreate';
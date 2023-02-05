/**
 * @author uAtomicBoolean
 * @file
 *		Simple 'ready' event logging when the bot is ready.
 */

import { Bot } from 'src/lib/bot';


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Handler for the event.
 */
export async function execute(client: Bot) {
	client.log('Bot is ready !');
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
export const name = 'ready';
export const once = true;
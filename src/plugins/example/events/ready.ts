/**
 * @author uAtomicBoolean
 * @file
 *		Simple 'ready' event logging when the bot is ready.
 */


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Handler for the event.
 */
export async function execute() {
	console.log('Bot is ready !');
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
export const name = 'ready';
export const once = true;
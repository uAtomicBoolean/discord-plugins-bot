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
async function execute() {
	console.log('Bot is ready !');
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: 'ready',
	execute,
	once: true,
};
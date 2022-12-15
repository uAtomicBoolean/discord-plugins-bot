/**
 * @author uAtomicBoolean
 * @file
 *		Handler pour l'évènement messageCreate.
*		Cet évènement est utilisé dans de multiples modules.


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Handler pour l'évènement.
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
import { Bot } from '@lib/bot';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.example' });


// You must use your own intents and partials for the bot to run properly.
const client = new Bot({
	intents: [],
	partials: [],
});

// Adding a listener for the nodejs' errors that are not handled.
process.on('unhandledRejection', error => {
	client.logger.warn('Error not handled !');
	console.error(error);
});


(async () => {
	await client.start();

	if (process.argv.includes('-L')) {
		await client.uploadCommands();
	}
	else {
		await client.uploadCommands(process.env.BASE_GUILD_ID);
	}
})();

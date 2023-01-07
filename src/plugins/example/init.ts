import { Bot } from '@lib/bot';


export const enabled = true;

export async function init(client: Bot) {
	console.log("The initialisation function for the 'example' plugin.");
}

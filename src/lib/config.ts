// This variable is necessary to load the plugins from dist and
// not src (and the opposite) when running the code after compilation.
// You can change it if you want to change the locations of the plugins.
export const PLUGINS_PATH = `${__dirname}/../plugins`;

// Specify if the bot will check the existence of multiples handlers for the interactionCreate event.
// If true, the bot will stop the execution after displaying an error.
export const CHECK_INTERACTION_CREATE_HANDLER = true;

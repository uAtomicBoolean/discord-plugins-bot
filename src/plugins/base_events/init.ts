/**
 * @author uAtomicBoolean
 * @description The plugins only contains some base events.
 * A global event is an event functionnality that should not be used in multiples plugins
 * as it can cause some bugs.
 * Take as an example the 'interactionCreate' event, if multiple plugings 
 * executes the bot's commands, then some errors will occurs as multiples 
 * functions will try to reply to the same interaction.
 * 
 * But it does not mean that a plugin can't handle this event, it only means that if multiple
 * plugins events' handlers do the same functionnality, then this functionnality should be put 
 * in this plugin.
 */

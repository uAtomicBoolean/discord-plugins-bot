import { Collection, SlashCommandBuilder } from 'discord.js';


export type discordId = string | null;
export type commandsArray = Collection<string, { command: SlashCommandBuilder, execute: Function}>;

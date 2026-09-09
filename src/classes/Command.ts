import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "discord.js";
import CustomClient from "./CustomClient";

export default abstract class Command {
    devOnly = false
    abstract builder: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder
    abstract execute(interaction: ChatInputCommandInteraction, client: CustomClient): Promise<void>
}
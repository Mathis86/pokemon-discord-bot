import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import Command from "../../classes/Command";

/**
 * Renvoie simplement "Pong"
 */
class Ping extends Command {
    builder: SlashCommandBuilder = new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Pour tester")

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        interaction.reply("Pong!")
    }
}

export default new Ping()
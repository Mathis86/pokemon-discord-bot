import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import Command from "../../classes/Command";
import UserService from "../../services/userService";
import CustomClient from "../../classes/CustomClient";

/**
 * Récupère entre 8 et 13 pièces périodiquement
 */
class Hourly extends Command {
    builder = new SlashCommandBuilder()
        .setName('hourly')
        .setDescription('Reçois des pièces périodiquement.');

    async execute(interaction: ChatInputCommandInteraction, client: CustomClient): Promise<void> {
        const userId = interaction.user.id
        const randomAmount = Math.floor(Math.random() * 6 + 8) // Math.random renvoie entre 0 et 1 exclu

        await client.userService.addBalance(userId, randomAmount)

        interaction.reply(`Vous avez reçu ${randomAmount} pièces !`)
    }
}

export default new Hourly()
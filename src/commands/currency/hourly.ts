import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import Command from "../../classes/Command";
import UserService from "../../services/userService";

/**
 * Récupère entre 8 et 13 pièces périodiquement
 */
class Hourly extends Command {
    builder = new SlashCommandBuilder()
        .setName('hourly')
        .setDescription('Reçois des pièces périodiquement.');

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const userId = interaction.user.id
        const randomAmount = Math.floor(Math.random() * 6 + 8) // Math.random renvoie entre 0 et 1 exclu

        UserService.addBalance(randomAmount, userId)

        interaction.reply(`Vous avez reçu ${randomAmount} pièces !`)
    }
}

export default new Hourly()
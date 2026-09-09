import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import Command from "../../classes/Command";
import UserService from "../../services/userService";
import CustomClient from "../../classes/CustomClient";

/**
 * Retourne le nombre de pièces d'un utilisateur
 */
class Balance extends Command {
    builder = new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Consulte ta balance.');

    async execute(interaction: ChatInputCommandInteraction, client: CustomClient): Promise<void> {
        const userId = interaction.user.id
        const balance = await client.userService.getBalance(userId)

        interaction.reply(`Vous avez ${balance} pièces !`)
    }
}

export default new Balance()
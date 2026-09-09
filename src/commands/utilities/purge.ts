import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import Command from "../../classes/Command";

/**
 * Supprime les 1-10 derniers messages
 */
class Purge extends Command {
    devOnly: boolean = true;
    builder = new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Supprimer des messages')
        .addIntegerOption(option => option
            .setName('quantité')
            .setDescription('Nombre de messages à supprimer')
            .setMinValue(1)
            .setMaxValue(50)
            .setRequired(true)
        )

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const amount = interaction.options.getInteger("quantité") || 1

        const messages = await interaction.channel?.messages.fetch({limit: amount})

        if (!messages || messages.size === 0) {
            interaction.reply({content: "Il n'y a pas de messages à supprimer...", flags: [MessageFlags.Ephemeral]})
            return
        } else {

        }

        let deletedMessagesCount = 0
        for (const message of messages.values()) {
            if (!message.deletable) return
            message.delete().catch(() => {})
            deletedMessagesCount++
        }

        interaction.reply({ content: `${deletedMessagesCount} message(s) supprimé(s) !`, flags: [MessageFlags.Ephemeral] })
    }
    
}

export default new Purge()
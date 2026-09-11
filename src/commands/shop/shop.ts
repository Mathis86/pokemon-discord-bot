import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import Command from "../../classes/Command";
import CustomClient from "../../classes/CustomClient";
import { getContainerAndAttachments } from "./view";

/**
 * Ouvre la boutique de boosters 
 */
class Shop extends Command {
    builder = new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Ouvre le shop de boosters');

    async execute(interaction: ChatInputCommandInteraction, client: CustomClient): Promise<void> {
        const username = interaction.user.displayName
        const userId = interaction.user.id
        const userBalance = await client.userService.getBalance(userId)
        let shopSets = await client.shopService.getCurrentSets()
        let userQuantities: { setId: string, quantity: number }[] = []

        const view = await getContainerAndAttachments({ client, username, userBalance, shopSets })

        // Réponse finale
        const response = await interaction.reply({
            components: [view.container],
            files: [...view.attachments],
            flags: MessageFlags.IsComponentsV2
        })

        const collector = response.createMessageComponentCollector()

        collector.on('collect', async (i) => {
            try {
                if (i.user.id !== interaction.user.id) {
                    i.reply({ content: "Vous n'êtes pas l'auteur de ce message...", flags: MessageFlags.Ephemeral })
                    return
                }

                if (i.customId.startsWith('quantity') && i.isStringSelectMenu()) {
                    const setId = i.customId.split('-')[1]
                    const quantity = parseInt(i.values[0])
                    if (!isNaN(quantity)) {
                        const userQuantity = userQuantities.find(q => q.setId === setId)
                        if (userQuantity) userQuantity.quantity = quantity
                        i.deferUpdate()
                    }
                    return
                }

                const setIdToBuy = i.customId
                const shopSet = shopSets.find(s => s.set.id === setIdToBuy)
                if (!shopSet) {
                    i.deferUpdate()
                    return
                }

                const view = await getContainerAndAttachments({ client, username, userBalance, shopSets })
                await i.update({
                    components: [view.container],
                    files: [...view.attachments]
                })

            } catch (err) {
                console.error(err)
            }
        })

        // Actualiser le shop au refresh s'il est toujours ouvert
        client.shopService.events.addListener('shopRefreshed', async () => {
            shopSets = await client.shopService.getCurrentSets()
            const view = await getContainerAndAttachments({ client, username, userBalance, shopSets })
            // Actualisation du shop
            interaction.editReply({
                components: [view.container],
                files: [...view.attachments]
            })
        })
    }
}

export default new Shop()
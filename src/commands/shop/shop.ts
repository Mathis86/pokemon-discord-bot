import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags, StringSelectMenuInteraction, ButtonInteraction } from "discord.js";
import Command from "../../classes/Command";
import CustomClient from "../../classes/CustomClient";
import { getContainerAndAttachments } from "./view";
import CustomCollector from "../../classes/CustomCollector";
import { ShopSetDTO } from "../../services/shopService";

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
        let userQuantities: Map<string, number> = new Map()

        const view = await getContainerAndAttachments({ client, username, userBalance, shopSets })

        // Réponse finale
        const response = await interaction.reply({
            components: [view.container],
            files: [...view.attachments],
            flags: MessageFlags.IsComponentsV2
        })

        new CustomCollector(response)
            .addRoute('quantity', (i, setId) => updateQuantityToBuy(i as StringSelectMenuInteraction, setId, userQuantities))
            .addRoute('buy', async (i, setId) => buy({ i: i as ButtonInteraction, setId, client, username, userBalance, shopSets }))

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

/**
 * Change la quantité de boosters à acheter grâce à un select menu
 */
function updateQuantityToBuy(i: StringSelectMenuInteraction, setId: string, userQuantities: Map<string, number>) {
    const quantity = parseInt(i.values[0])
    if (!isNaN(quantity)) {
        const quantity = userQuantities.get(setId)
        if (quantity) userQuantities.set(setId, quantity)
        i.deferUpdate()
    }
}

/**
 * Achète une certaine quantité de boosters
 */
async function buy({ i, setId, client, username, userBalance, shopSets }: {
    i: ButtonInteraction,
    setId: string,
    client: CustomClient,
    username: string,
    userBalance: number,
    shopSets: ShopSetDTO[]
}) {
    const shopSet = shopSets.find(s => s.set.id === setId)
    if (!shopSet) {
        i.deferUpdate()
        return
    }

    const view = await getContainerAndAttachments({ client, username, userBalance, shopSets })
    await i.update({
        components: [view.container],
        files: [...view.attachments]
    })
}
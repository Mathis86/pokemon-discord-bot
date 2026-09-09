import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags, ContainerBuilder, AttachmentBuilder, ButtonStyle, SeparatorSpacingSize } from "discord.js";
import Command from "../classes/Command";
import { getAttachment } from "../utils";
import CustomClient from "../classes/CustomClient";
import { ShopSetDTO } from "../services/shopService";

type UserCart = {
    setId: string,
    quantity: number
}[]

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
        const userCart: UserCart = []

        const view = await getContainerAndAttachments({ client, username, userBalance, shopSets, userCart })

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

                const setIdToBuy = i.customId
                const shopSet = shopSets.find(s => s.set.id === setIdToBuy)
                if (!shopSet) return

                addToCartOrUpdate(setIdToBuy, userCart)
                
                const view = await getContainerAndAttachments({ client, username, userBalance, shopSets, userCart })
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
            const view = await getContainerAndAttachments({ client, username, userBalance, shopSets, userCart })
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
 * Retourne le container et les attachments à renvoyer à l'utilisateur
 */
async function getContainerAndAttachments({ client, username, userBalance, buttonsDisabled = false, shopSets, userCart }: {
    client: CustomClient, 
    username: string, 
    userBalance: number, 
    buttonsDisabled?: boolean,
    shopSets: ShopSetDTO[],
    userCart: UserCart
}) {
    const attachments: AttachmentBuilder[] = []

    // Traitement de l'image du shop
    const shopImage = getAttachment('shop.png')
    attachments.push(shopImage.attachment)

    // Timestamp de la prochaine réinitialisation
    const nextRefreshIn = client.shopService.getSecondsOfNextRefresh()

    // Container principal
    const container = new ContainerBuilder()
        .setAccentColor(0x4B80BD) // Bleu comme le Pokémon Shop
        // Titre principal du shop
        .addSectionComponents(section => section
            .addTextDisplayComponents(text => text.setContent('# Magasin de boosters'))
            .addTextDisplayComponents(text => text.setContent(`Prochaine réinitialisation **<t:${nextRefreshIn}:R>**`))
            .addTextDisplayComponents(text => text.setContent(`${username} • ${userBalance} pièce(s)`))
            .setThumbnailAccessory(thumb => thumb.setURL(shopImage.discordURL)))

    // Itération sur chaque extension qui existe dans la DB
    for (const shopSet of shopSets) {
        const cardsCountDummy = Math.floor(Math.random() * 50)
        const set = shopSet.set

        container
            .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Large))
            // Nom de l'extension au dessus de la bannière
            .addTextDisplayComponents(text => text.setContent(`## ${set.name} (${set.releaseYear})`))
            // Ajout de l'image bannière de l'extension
            .addMediaGalleryComponents(media => media
                .addItems(item => item.setURL(set.logo || 'https://assets.tcgdex.net/en/base/base1/logo.webp').setDescription(`Image de ${set.name}`))
            )
            // Ajout de la ligne contenant le bouton d'achat + des infos propres à la collection de l'utilisateur
            .addSectionComponents(section => section
                .addTextDisplayComponents(text => text.setContent(`${shopSet.price} pièce(s) • **${cardsCountDummy} / ${set.cardCount.total}** cartes possédée(s)`))
                .setButtonAccessory(btn => btn
                    .setCustomId(set.id)
                    .setLabel('Acheter')
                    .setEmoji({ name: '➕' })
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(buttonsDisabled)
                )
            )
    }

    // Ajout du panier de l'utilisateur
    container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Large))
    for (const article of userCart) {
        container.addSectionComponents(section => section
            .addTextDisplayComponents(text => text.setContent(`${article.setId} x${article.quantity}`))
            .setButtonAccessory(btn => btn
                .setCustomId(`remove-${article.setId}`)
                .setLabel("Retirer 1")
                .setEmoji({ name: '➖' })
                .setStyle(ButtonStyle.Danger)
            )
        )
    }

    return { container, attachments }
}

function addToCartOrUpdate(setId: string, cart: UserCart) {
    let updated = false
    cart.forEach(article => {
        if (article.setId === setId) {
            article.quantity++
            updated = true
        }
    })

    if (!updated) cart.push({
        setId,
        quantity: 1
    })
}
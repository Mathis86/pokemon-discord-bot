import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags, ContainerBuilder, AttachmentBuilder, ButtonStyle, SeparatorSpacingSize } from "discord.js";
import Command from "../classes/Command";
import { getAttachment } from "../utils";
import UserService from "../services/userService";
import ShopService from "../services/shopService";
import CustomClient from "../classes/CustomClient";

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

        const view = await getContainerAndAttachments(client, username, userBalance)

        // Réponse finale
        await interaction.reply({
            components: [view.container],
            files: [...view.attachments],
            flags: MessageFlags.IsComponentsV2
        })

        // Actualiser le shop au refresh s'il est toujours ouvert
        client.shopService.events.addListener('shopRefreshed', async () => {
            const view = await getContainerAndAttachments(client, username, userBalance)
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
async function getContainerAndAttachments(client: CustomClient, username: string, userBalance: number, buttonsDisabled = false) {
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
    for (const set of await client.shopService.getCurrentSets()) {
        const cardsCountDummy = Math.floor(Math.random() * 50)

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
                .addTextDisplayComponents(text => text.setContent(`100 pièce(s) • **${cardsCountDummy} / ${set.cardCount.total}** cartes possédée(s)`))
                .setButtonAccessory(btn => btn
                    .setCustomId(`buy-${set.id}`)
                    .setLabel('Acheter')
                    .setEmoji({ name: '➕' })
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(buttonsDisabled)
                )
            )
    }

    return { container, attachments }
}
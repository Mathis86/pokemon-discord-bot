import { AttachmentBuilder, ContainerBuilder, SeparatorSpacingSize, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js"
import CustomClient from "../../classes/CustomClient"
import { ShopSetDTO } from "../../services/shopService"
import { getAttachment } from "../../utils"

/**
* Retourne le container et les attachments à renvoyer à l'utilisateur
*/
export async function getContainerAndAttachments({ client, username, userBalance, buttonsDisabled = false, shopSets }: {
   client: CustomClient,
   username: string,
   userBalance: number,
   buttonsDisabled?: boolean,
   shopSets: ShopSetDTO[]
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
         // Image bannière de l'extension
         .addMediaGalleryComponents(media => media
            .addItems(item => item.setURL(set.logo || 'https://assets.tcgdex.net/en/base/base1/logo.webp').setDescription(`Image de ${set.name}`))
         )
         // Ligne contenant le bouton d'achat + des infos propres à la collection de l'utilisateur
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
         // Select menu pour choisir la quantité à acheter
         const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`quantity-${set.id}`)
         for (let i = 1; i <= 10; i++) {
            selectMenu.addOptions(new StringSelectMenuOptionBuilder()
               .setLabel(`Quantité : ${i} • Prix : ${shopSet.price * i}`)
               .setDescription('Description test')
               .setValue(i.toString())
               .setDefault(i === 1)
            )
         }
         container.addActionRowComponents(row => row.addComponents(selectMenu))
   }

   return { container, attachments }
} 
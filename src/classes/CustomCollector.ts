import { InteractionCollector, InteractionResponse, MappedInteractionTypes, MessageFlags } from "discord.js";

type RouteFunction = (i: MappedInteractionTypes[keyof MappedInteractionTypes], ...params: string[]) => void
export default class CustomCollector {
   collector: InteractionCollector<MappedInteractionTypes[keyof MappedInteractionTypes]>
   routes: Map<string, RouteFunction> = new Map()

   constructor(message: InteractionResponse, public authorId?: string) {
      this.collector = message.createMessageComponentCollector()

      this.collector.on('collect', async (i) => {
         try {
            if (this.authorId && i.user.id !== authorId) {
               i.reply({ content: "Vous n'êtes pas l'auteur de ce message...", flags: MessageFlags.Ephemeral })
               return
            }

            const params = i.customId.split('-')
            const id = params.shift()
            const fn = this.routes.get(id || "")
            if (fn) fn(i, ...params)
         } catch (err) {
            console.error(err)
         }
      })
   }

   addRoute(id: string, fn: RouteFunction): this {
      this.routes.set(id, fn)
      return this
   }
}
import config from "../config";
import { Collection, GatewayIntentBits } from "discord.js"
import { forEachCommandDo } from "./utils";
import Command from "./classes/Command";
import CustomClient from "./classes/CustomClient";

const client = new CustomClient({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

// Charger les commandes dans le code
const commands = new Collection<string, Command>()
forEachCommandDo((command) => commands.set(command.builder.name, command))

// Réception des interactions
client.on("interactionCreate", (interaction) => {
    // On ne traite que les chat input commands pour l'instant
    if (!interaction.isChatInputCommand()) return

    const command = commands.get(interaction.commandName)
    if (!command) return

    command.execute(interaction, client).catch((err) => {
        console.error(err)
        // Permet de pouvoir répondre peu importe l'état de l'interaction        
        if (interaction.deferred || interaction.replied) interaction.followUp("Une erreur a eu lieu...").catch((err) => console.error(err))
        else interaction.reply("Une erreur a eu lieu...").catch((err) => console.error(err))
    })
})

client.once("clientReady", () => {
    console.log("Le bot est prêt !")

    // Lancement du refresh périodique du shop
    client.shopService.startRefreshJob()
})

client.start()
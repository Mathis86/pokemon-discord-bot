import { REST, Routes } from "discord.js"
import config from "../config"
import { forEachCommandDo } from "../src/utils"
import Command from "../src/classes/Command"

const commands: Command[] = []

forEachCommandDo((command) => commands.push(command))

const globalCommands = commands.filter(c => !c.devOnly)
const devCommands = commands.filter(c => c.devOnly)

const rest = new REST().setToken(config.botToken)

// Déploiement des commandes globales
rest.put(
    Routes.applicationCommands(config.botId),
    { body: globalCommands.map(c => c.builder.toJSON()) }
)
.then(() => console.log(`[GLOBAL] ${globalCommands.length} commande(s) mise(s) à jour.`))
.catch((err) => console.error("[GLOBAL] Une erreur a eu lieu lors de la mise à jour des commands.", err))

// Déploiement des commandes devOnly
if (config.devGuildId) {
    rest.put(
        Routes.applicationGuildCommands(config.botId, config.devGuildId),
        { body: devCommands.map(c => c.builder.toJSON()) }
    )
    .then(() => console.log(`[DEV] ${devCommands.length} commande(s) mise(s) à jour.`))
    .catch((err) => console.error("[DEV] Une erreur a eu lieu lors de la mise à jour des commands.", err))
}
else if (devCommands.length > 0) {
    console.log("[DEV] DEV_GUILD_ID non spécifié dans le .env")
}
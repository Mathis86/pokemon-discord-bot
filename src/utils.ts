import path from 'path'
import fs from 'fs'
import Command from './classes/Command'
import { AttachmentBuilder } from 'discord.js'

/**
 * Itère sur les commandes dans "commands".
 * @param callback Exécuté pour chaque commande
 */
export function forEachCommandDo(callback: (command: Command) => void) {
    const commandsPath = path.join(process.cwd(), "src/commands")
    const commandsFiles = fs.readdirSync(commandsPath, {
        recursive: true, 
        encoding: 'utf-8'
    }).filter(f => f.endsWith(".ts"))
    
    for (const file of commandsFiles) {
        const command = require(path.join(commandsPath, file)).default
        if (!(command instanceof Command)) continue
        callback(command)
    }
}

/**
 * Renvoie un objet qui simplifie l'utilisation des attachments
 * @param fileName Nom du fichier à récupérer dans le dossier "assets"
 */
export function getAttachment(filePath: string) {
    const attachment = new AttachmentBuilder(path.join(process.cwd(), 'assets', filePath))
    const fileName = filePath.split('/').pop()
    if (!fileName) throw new Error("Le nom du fichier n'a pas pu être résolu.")

    return {
        attachment,
        discordURL: `attachment://${fileName}`
    }
}

/**
 * Renvoie une URL d'image redimensionnée (utilise l'API wsrv.nl)
 */
export function resizeImageUrl(url: string, width: number, height: number) {
    const encoded = encodeURIComponent(url)
    return `https://wsrv.nl/?url=${encoded}&w=${width}&h=${height}&fit=inside`;
}
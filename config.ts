import dotenv from "dotenv"
dotenv.config()
import path from "path"

const dbPath = path.join(process.cwd(), 'data', (process.env.DB_NAME || "app") + '.db')
const config = {
    botToken: process.env.BOT_TOKEN || "",
    botId: process.env.BOT_ID || "",
    devGuildId: process.env.DEV_GUILD_ID || null,
    dbPath
} as const

export default config
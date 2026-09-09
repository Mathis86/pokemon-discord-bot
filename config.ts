import dotenv from "dotenv"
dotenv.config()
import path from "path"

const config = {
    botToken: process.env.BOT_TOKEN || "",
    botId: process.env.BOT_ID || "",
    devGuildId: process.env.DEV_GUILD_ID || null,
    dbUrl: process.env.DATABASE_URL || ""
} as const

export default config
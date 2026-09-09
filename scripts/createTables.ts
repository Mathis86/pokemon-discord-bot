import Database from "better-sqlite3"
import config from "../config"

const db = new Database(config.dbPath)

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        discord_id STRING NOT NULL UNIQUE,
        balance INTEGER DEFAULT 0
    )
`)

db.exec(`
    CREATE TABLE IF NOT EXISTS datas (
        id INTEGER PRIMARY KEY,
        key STRING NOT NULL UNIQUE,
        value STRING NOT NULL
    )
`)
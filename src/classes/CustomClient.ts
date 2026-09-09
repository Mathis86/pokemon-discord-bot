import { Client } from "discord.js";
import Database from 'better-sqlite3'
import config from "../../config";
import ShopService from "../services/shopService";

export default class CustomClient extends Client {
    db = new Database(config.dbPath)
    shopService = new ShopService()

    start() {
        this.login(config.botToken)
    }
}
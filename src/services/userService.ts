import Database from 'better-sqlite3'
import config from '../../config'
import { User } from '../../data/tables'

const db = new Database(config.dbPath)

export default class UserService {
    /**
     * Incrémente la balance d'un utilisateur
     */
    static addBalance(amount: number, discordId: string) {
        db.prepare(`
            INSERT INTO users (discord_id, balance)
            VALUES (?, ?)
            ON CONFLICT DO UPDATE SET balance = balance + ?
        `).run(discordId, amount, amount)
    }

    /**
     * Retourne la balance d'un utilisateur
     */
    static getBalance(discordId: string) {
        const balance = db.prepare<string, Pick<User, 'balance'>>(`
            SELECT balance FROM users WHERE discord_id = ?
        `).get(discordId)?.balance || 0

        return balance
    }
}
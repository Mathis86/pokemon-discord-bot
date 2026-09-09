import Database from 'better-sqlite3'
import config from '../../config'
import CardService from './cardService'
import { CronJob } from 'cron'
import { Data } from '../../data/tables'
import EventEmitter from 'events'

// Clés utilisées pour le champ "key" table "datas"
const enum Keys {
    ShopSets = 'shopSets'
}

// Type associé au champ "value" de la table "datas"
type DataValue = Pick<Data, 'value'>

// Variables globales
const db = new Database(config.dbPath)
let refreshJob: CronJob | undefined = undefined

/**
 * Service de gestion du shop
 */
export default class ShopService {
    events = new EventEmitter()
    
    /**
     * Démarre le job qui refresh le shop toutes les demie heures
     */
    async startRefreshJob() {
        if (!refreshJob) refreshJob = new CronJob('* * * * *', async () => {
            const randomSets = await CardService.getRandomSetResumes(3)

            const update = db.prepare(`
                INSERT INTO datas (key, value)
                VALUES ('${Keys.ShopSets}', ?)
                ON CONFLICT DO UPDATE SET value = ?    
            `)

            const setIdsString = randomSets.map(s => s.id).join(',')
            update.run(setIdsString, setIdsString)
            this.events.emit('shopRefreshed')
        }, null, true, 'Europe/Paris')

        // Exécuter le job immédiatement dans le cas où aucune extension n'est dispo dans le shop
        const currentSetIds = db.prepare<unknown[], DataValue>(`SELECT value FROM datas WHERE key = '${Keys.ShopSets}'`).get()
        if (!currentSetIds) refreshJob.fireOnTick()
    }

    /**
     * Retourne le nombre de secondes avant le prochain refresh du shop
     */
    getSecondsOfNextRefresh() {
        if (!refreshJob) throw new Error("Le job de refresh du shop n'a pas été lancé.")

        return Math.floor(refreshJob.nextDate().toMillis() / 1000)
    }

    /**
     * Retourne le détail des extensions actuellement présentes dans le shop
     */
    async getCurrentSets() {
        const setsIdsString = db.prepare<unknown[], DataValue>(`SELECT value FROM datas WHERE key = '${Keys.ShopSets}'`).get()
        
        if (!setsIdsString) return []

        const setsIds = setsIdsString.value.split(',')

        return await CardService.getSets(setsIds)
    }
}
import CardService from './cardService'
import { CronJob } from 'cron'
import EventEmitter from 'events'
import ShopRepository from '../repositories/shopRepository'

// Variables globales
let refreshJob: CronJob | undefined = undefined

/**
 * Service de gestion du shop
 */
export default class ShopService {
    events = new EventEmitter()

    constructor(
        public shopRepository: ShopRepository
    ) {}
    
    /**
     * Démarre le job qui refresh le shop toutes les demie heures
     */
    async startRefreshJob() {
        if (!refreshJob) refreshJob = new CronJob('* * * * *', async () => {
            const randomSets = await CardService.getRandomSetResumes(3)

            this.shopRepository.prisma.$transaction(async (tx) => {
                await this.shopRepository.clear(tx)
                for (const randomSet of randomSets) {
                    // Prix aléatoire entre 100 et 200 par tranches de 25
                    const randomPrice = 100 + 25 * Math.floor(Math.random() * 5)
                    await this.shopRepository.addSet(randomSet.id, randomPrice, tx)
                }
            })
            
            this.events.emit('shopRefreshed')
        }, null, true, 'Europe/Paris')

        // Exécuter le job immédiatement dans le cas où aucune extension n'est dispo dans le shop
        const currentSetIds = await this.shopRepository.getSets()
        if (currentSetIds.length === 0) refreshJob.fireOnTick()
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
        const shopSets = await this.shopRepository.getSets()
        
        if (shopSets.length === 0) return []

        return await CardService.getSets(shopSets.map(s => s.setId))
    }
}
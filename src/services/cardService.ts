import TCGdex, { Set, SetResumeModel } from '@tcgdex/sdk'
import { resizeImageUrl } from '../utils'

type SetDTO = Pick<Set, 'id' | 'name' | 'symbol' | 'cardCount'> & { logo: string, releaseYear: string }

const tcgdex = new TCGdex('fr')
const tcgdexEN = new TCGdex('en')

/**
 * Service de gestion des cartes (utilise l'API TCGdex)
 */
export default class CardService {
    /**
     * Récupère un certain nombre de résumés d'extensions aléatoires
     */
    static async getRandomSetResumes(max: number) {
        const sets = await tcgdex.set.list()
        
        const randomSets: SetResumeModel[] = []

        for (let i = 0; i < max; i++) {
            const randomIndex = Math.floor(Math.random() * sets.length)
            randomSets.push(sets[randomIndex])
            delete sets[randomIndex]
        }

        return randomSets
    }

    /**
     * Récupère le détail des extensions dont l'id est passé en paramètre
     */
    static async getSets(ids: string[]): Promise<SetDTO[]> {
        if (ids.length === 0) return []

        const setResumes = await tcgdex.set.list()
        const filteredSetResumes = setResumes.filter(s => ids.includes(s.id))

        const setDetails: SetDTO[] = []
        for (const setResume of filteredSetResumes) {
            const set = await setResume.getSet()
            let logo = set.logo

            // Récupérer le logo anglais si le fr n'existe pas
            if (!logo) logo = (await tcgdexEN.set.get(set.id))?.logo

            setDetails.push({
                id: set.id,
                name: set.name,
                logo: resizeImageUrl((logo || 'https://assets.tcgdex.net/en/base/base1/logo') + '.webp', 800, 200),
                symbol: set.symbol,
                cardCount: set.cardCount,
                releaseYear: set.releaseDate.substring(0, 4)
            })
        }

        return setDetails
    }
}
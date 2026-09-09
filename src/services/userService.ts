import UserRepository from "../repositories/userRepository"

export default class UserService {
    constructor(
        public userRepository: UserRepository
    ) {}

    /**
     * Incrémente la balance d'un utilisateur
     */
    async addBalance(discordId: string, amount: number) {
        await this.userRepository.addBalance(discordId, amount)
    }

    /**
     * Retourne la balance d'un utilisateur
     */
    async getBalance(discordId: string) {
        return await this.userRepository.getBalance(discordId)
    }
}
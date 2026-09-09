import CustomPrismaClient from "../classes/CustomPrismaClient";
import Repository from "./repository";

export default class UserRepository extends Repository {
    constructor(
        public prisma: CustomPrismaClient
    ) { super() }

    /**
     * Incrémente la balance d'un utilisateur
     */
    async addBalance(discordId: string, amount: number) {
        await this.prisma.user.upsert({
            update: {
                balance: { increment: amount }
            },
            where: {
                discordId
            },
            create: {
                discordId,
                balance: amount
            }
        })
    }

    /**
     * Retourne la balance d'un utilisateur (s'il n'existe pas, retourne 0)
     */
    async getBalance(discordId: string) {
        const user = await this.prisma.user.findUnique({
            where: { discordId }
        })

        return user?.balance || 0
    }
}
import { TransactionClient } from "../../prisma/client/internal/prismaNamespace";
import CustomPrismaClient from "../classes/CustomPrismaClient";
import Repository from "./repository";

export default class ShopRepository extends Repository {
    constructor(
        public prisma: CustomPrismaClient
    ) { super() }

    async addSet(setId: string, price: number, tx?: TransactionClient) {
        await this.getClient(tx).shop.create({
            data: { setId, price }
        })
    }

    async getSets() {
        return await this.prisma.shop.findMany()
    }

    async clear(tx: TransactionClient) {
        await this.getClient(tx).shop.deleteMany()
    }
}
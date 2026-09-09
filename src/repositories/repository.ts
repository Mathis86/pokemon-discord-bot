import { TransactionClient } from "../../prisma/client/internal/prismaNamespace";
import CustomPrismaClient from "../classes/CustomPrismaClient";

export default abstract class Repository {
    abstract prisma: CustomPrismaClient

    getClient(tx: TransactionClient | undefined) {
        return tx || this.prisma
    }
}
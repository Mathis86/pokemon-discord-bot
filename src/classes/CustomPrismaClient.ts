import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../prisma/client/client";
import config from "../../config";

export default class CustomPrismaClient extends PrismaClient {
    constructor() {
        const adapter = new PrismaBetterSqlite3({ url: config.dbUrl });
        super({ adapter });
    }
}
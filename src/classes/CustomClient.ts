import { Client, ClientOptions } from "discord.js";
import config from "../../config";
import ShopService from "../services/shopService";
import CustomPrismaClient from "./CustomPrismaClient";
import UserService from "../services/userService";
import UserRepository from "../repositories/userRepository";
import ShopRepository from "../repositories/shopRepository";

export default class CustomClient extends Client {
    userService: UserService
    shopService: ShopService

    constructor(options: ClientOptions) {
        super(options)

        const prisma = new CustomPrismaClient()
        const userRepository = new UserRepository(prisma)
        const shopRepository = new ShopRepository(prisma)

        this.userService = new UserService(userRepository)
        this.shopService = new ShopService(shopRepository)
    }

    start() {
        this.login(config.botToken)
    }
}
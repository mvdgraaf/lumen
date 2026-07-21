import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config({path: process.cwd() + '/.env'});

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

export const prisma = new PrismaClient({ adapter });

export async function testConnection() {
    try {
        await prisma.$queryRaw`SELECT 1`;
        console.log("Connected to the database");
    } catch (error) {
        console.error("Error connecting to the database:", error);
        process.exit(1);
    }
}


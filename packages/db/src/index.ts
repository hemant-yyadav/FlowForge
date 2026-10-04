import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(__dirname, "../../../.env") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env["DATABASE_URL"];
if (!connectionString) {
    throw new Error("DATABASE_URL must be set in the repository-root .env file");
}
try {
    const protocol = new URL(connectionString).protocol;
    if (protocol !== "postgres:" && protocol !== "postgresql:") throw new Error();
} catch {
    throw new Error("DATABASE_URL must be a valid PostgreSQL connection URL");
}
const adapter = new PrismaPg({ connectionString });

export const prismaClient = new PrismaClient({ adapter });

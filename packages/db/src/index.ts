import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(__dirname, "../../../.env") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env["DATABASE_URL"] as string;
const adapter = new PrismaPg({ connectionString });

export const prismaClient = new PrismaClient({ adapter });

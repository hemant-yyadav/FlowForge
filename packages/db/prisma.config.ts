/// <reference types="node" />
import { config } from "dotenv";
import path from "path";
import { defineConfig } from "prisma/config";

// Prisma commands run from packages/db, while application services load the
// repository-root .env. Keep both paths aligned.
config({ path: path.resolve(__dirname, "../../.env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});

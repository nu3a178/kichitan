import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const pool = new Pool({
  connectionString:
    process.env.NODE_ENV === "development"
      ? process.env.DATABASE_URL_DEV
      : process.env.DATABASE_URL_PROD,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export { prisma };

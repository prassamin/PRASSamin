import { PrismaClient } from "@prisma/client/edge";

const db = new PrismaClient()

export { db };

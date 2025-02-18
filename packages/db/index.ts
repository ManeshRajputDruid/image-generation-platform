import { PrismaClient } from '@prisma/client';
//convert this to a singleton for next.js
const prismaClient = new PrismaClient();
export default prismaClient;

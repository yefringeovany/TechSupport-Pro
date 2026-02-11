import { PrismaClient } from '@prisma/client';

// Declaración global 
declare global {
  var prisma: PrismaClient | undefined;
}

//Prisma Client
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

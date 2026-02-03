import { PrismaClient } from '@prisma/client';

// Declaración global para evitar múltiples instancias en desarrollo
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Singleton de Prisma Client
// En desarrollo, evita crear múltiples instancias por hot-reload
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
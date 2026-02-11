import { prisma } from "../../config/prisma.js";

export class AgentesService {
  async getAll() {
    return prisma.agente.findMany();
  }

  async getById(id: number) {
    return prisma.agente.findUnique({ where: { id } });
  }

  async create(data: { nombre: string; email: string; nivel: number; activo?: boolean }) {
    if (data.nivel < 1 || data.nivel > 3) {
      throw new Error("El nivel del agente debe ser 1, 2 o 3");
    }

    return prisma.agente.create({ data });
  }

  async update(id: number, data: Partial<{ nombre: string; email: string; nivel: number; activo: boolean }>) {
    if (data.nivel && (data.nivel < 1 || data.nivel > 3)) {
      throw new Error("El nivel del agente debe ser 1, 2 o 3");
    }

    return prisma.agente.update({ where: { id }, data });
  }

  async delete(id: number) {
    return prisma.agente.update({ where: { id }, data: { activo: false } });
  }
}

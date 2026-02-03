import { prisma } from "../../config/prisma.js";

export class TicketsService {

  // ✅ Crear ticket
  static async createTicket(data: any) {
    return await prisma.ticket.create({
      data,
    });
  }

  // ✅ Obtener todos
  static async getTickets() {
    return await prisma.ticket.findMany({
      include: {
        cliente: true,
        agente: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // ✅ Obtener por ID
  static async getTicketById(id: number) {
    return await prisma.ticket.findUnique({
      where: { id },
      include: {
        cliente: true,
        agente: true,
      },
    });
  }

  // ✅ Actualizar
  static async updateTicket(id: number, data: any) {
    return await prisma.ticket.update({
      where: { id },
      data,
    });
  }

  // ✅ Soft delete
  static async deleteTicket(id: number) {
    return await prisma.ticket.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}

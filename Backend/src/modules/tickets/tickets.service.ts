import { prisma } from "../../config/prisma.js";
import { Prisma } from "@prisma/client";

export class TicketsService {

  // ✅ Crear ticket
  static async createTicket(data: Prisma.TicketUncheckedCreateInput) {

    // 🔥 Validar que el cliente exista
    const cliente = await prisma.cliente.findUnique({
      where: { id: data.clienteId }
    });

    if (!cliente) {
      throw new Error("El cliente no existe");
    }

    return prisma.ticket.create({
      data,
      include: {
        cliente: true,
        agente: true,
      }
    });
  }


  // ✅ Obtener todos (SIN eliminados)
  static async getTickets() {
    return prisma.ticket.findMany({

      where: {
        deletedAt: null, // 🔥 MUY profesional
      },

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

    const ticket = await prisma.ticket.findFirst({
      where: {
        id,
        deletedAt: null, // 🔥 evita mostrar eliminados
      },
      include: {
        cliente: true,
        agente: true,
      },
    });

    return ticket;
  }


  // ✅ Actualizar
  static async updateTicket(
    id: number,
    data: Prisma.TicketUncheckedUpdateInput
  ) {

    // validar que exista
    const ticket = await prisma.ticket.findFirst({
      where: {
        id,
        deletedAt: null
      }
    });

    if (!ticket) {
      throw new Error("Ticket no encontrado");
    }

    return prisma.ticket.update({
      where: { id },
      data,
    });
  }


  // ✅ Soft delete
  static async deleteTicket(id: number) {

    const ticket = await prisma.ticket.findFirst({
      where: {
        id,
        deletedAt: null
      }
    });

    if (!ticket) {
      throw new Error("Ticket no encontrado");
    }

    return prisma.ticket.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}

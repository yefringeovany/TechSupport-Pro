import { prisma } from "../../config/prisma.js";
import { Prisma, TicketStatus } from "@prisma/client";

export class TicketsService {

  // 🔥 Asignar ticket manualmente a un agente
  static async asignarTicket(ticketId: number, agenteId: number) {
    const ticket = await prisma.ticket.findFirst({
      where: { id: ticketId, deletedAt: null }
    });

    if (!ticket) throw new Error("Ticket no encontrado");

    const agente = await prisma.agente.findUnique({
      where: { id: agenteId }
    });

    if (!agente) throw new Error("Agente no existe");

    // Validar regla: tickets escalados solo nivel >=2
    if (ticket.estado === TicketStatus.ESCALADO && agente.nivel === 1) {
      throw new Error("Un agente nivel 1 no puede tomar tickets escalados");
    }

    return prisma.ticket.update({
      where: { id: ticketId },
      data: { agenteId },
      include: { cliente: true, agente: true }
    });
  }

  // 🔥 Resolver ticket y calcular tiempo de resolución
  static async resolverTicket(ticketId: number) {
    const ticket = await prisma.ticket.findFirst({
      where: { id: ticketId, deletedAt: null }
    });

    if (!ticket) throw new Error("Ticket no encontrado");

    if (ticket.estado === TicketStatus.RESUELTO) {
      throw new Error("El ticket ya está resuelto");
    }

    const ahora = new Date();
    const minutos = Math.floor(
      (ahora.getTime() - ticket.createdAt.getTime()) / (1000 * 60)
    );

    return prisma.ticket.update({
      where: { id: ticketId },
      data: {
        estado: TicketStatus.RESUELTO,
        fechaResolucion: ahora,
        tiempoResolucion: minutos
      },
      include: { cliente: true, agente: true }
    });
  }

  // ✅ Crear ticket con prioridad automática
  static async createTicket(data: Prisma.TicketUncheckedCreateInput) {
    const cliente = await prisma.cliente.findUnique({
      where: { id: data.clienteId }
    });
    if (!cliente) throw new Error("El cliente no existe");

    const prioridad: "MEDIA" | "ALTA" = cliente.tipo === "VIP" ? "ALTA" : "MEDIA";

    return prisma.ticket.create({
      data: { ...data, prioridad },
      include: { cliente: true, agente: true }
    });
  }

  // ✅ Obtener tickets
  static async getTickets(query: any) {
    const { estado, prioridad, clienteId, desde, hasta, page = 1, limit = 10 } = query;
    const where: Prisma.TicketWhereInput = { deletedAt: null };

    if (estado) where.estado = estado;
    if (prioridad) where.prioridad = prioridad;
    if (clienteId) where.clienteId = Number(clienteId);
    if (desde || hasta) {
      where.createdAt = {};
      if (desde) where.createdAt.gte = new Date(desde);
      if (hasta) where.createdAt.lte = new Date(hasta);
    }

    return prisma.ticket.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: { cliente: true, agente: true },
      orderBy: { createdAt: "desc" }
    });
  }

  // ✅ Obtener ticket por ID
  static async getTicketById(id: number) {
    return prisma.ticket.findFirst({
      where: { id, deletedAt: null },
      include: { cliente: true, agente: true }
    });
  }

  // ✅ Actualizar ticket con reglas de negocio
  static async updateTicket(id: number, data: Prisma.TicketUncheckedUpdateInput) {
    const ticket = await prisma.ticket.findFirst({ where: { id, deletedAt: null } });
    if (!ticket) throw new Error("Ticket no encontrado");

    // Validar máquina de estados
    const transiciones: Record<TicketStatus, TicketStatus[]> = {
      ABIERTO: [TicketStatus.EN_PROGRESO],
      EN_PROGRESO: [TicketStatus.RESUELTO],
      RESUELTO: [TicketStatus.CERRADO],
      CERRADO: [],
      ESCALADO: [TicketStatus.EN_PROGRESO]
    };

    if (data.estado) {
      const permitidos = transiciones[ticket.estado];
      if (!permitidos.includes(data.estado as TicketStatus)) {
        throw new Error(`No puedes cambiar un ticket de ${ticket.estado} a ${data.estado}`);
      }
    }

    // Validar nivel del agente
    if (data.agenteId) {
      const agente = await prisma.agente.findUnique({ where: { id: Number(data.agenteId) } });
      if (!agente) throw new Error("Agente no existe");
      if (ticket.estado === TicketStatus.ESCALADO && agente.nivel === 1) {
        throw new Error("Un agente nivel 1 no puede tomar tickets escalados");
      }
    }

    // Calcular tiempo de resolución si cambia a RESUELTO
    if (data.estado === TicketStatus.RESUELTO && !ticket.fechaResolucion) {
      const ahora = new Date();
      const minutos = Math.floor((ahora.getTime() - ticket.createdAt.getTime()) / (1000 * 60));
      data.fechaResolucion = ahora;
      data.tiempoResolucion = minutos;
    }

    return prisma.ticket.update({
      where: { id },
      data,
      include: { cliente: true, agente: true }
    });
  }

  // ✅ Soft delete
  static async deleteTicket(id: number) {
    const ticket = await prisma.ticket.findFirst({ where: { id, deletedAt: null } });
    if (!ticket) throw new Error("Ticket no encontrado");

    return prisma.ticket.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}

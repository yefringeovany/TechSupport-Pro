import { prisma } from "../../config/prisma.js";
import { Prisma, TicketStatus } from "@prisma/client";

export class TicketsService {

  // ✅ Crear ticket con prioridad automática
  static async createTicket(data: Prisma.TicketUncheckedCreateInput) {

    const cliente = await prisma.cliente.findUnique({
      where: { id: data.clienteId }
    });

    if (!cliente) {
      throw new Error("El cliente no existe");
    }

    // 🔥 PRIORIDAD AUTOMÁTICA
    let prioridad: "MEDIA" | "ALTA";

    if (cliente.tipo === "VIP") {
      prioridad = "ALTA";
    } else {
      prioridad = "MEDIA";
    }

    return prisma.ticket.create({
      data: {
        ...data,
        prioridad,
      },
      include: {
        cliente: true,
        agente: true,
      }
    });
  }

  // ✅ Obtener tickets con filtros + paginación
  static async getTickets(query: any) {

    const {
      estado,
      prioridad,
      clienteId,
      desde,
      hasta,
      page = 1,
      limit = 10
    } = query;

    const where: Prisma.TicketWhereInput = {
      deletedAt: null,
    };

    if (estado) {
      where.estado = estado;
    }

    if (prioridad) {
      where.prioridad = prioridad;
    }

    if (clienteId) {
      where.clienteId = Number(clienteId);
    }

    // ✅ Filtro de fechas sin undefined
    if (desde || hasta) {

      where.createdAt = {};

      if (desde) {
        where.createdAt.gte = new Date(desde);
      }

      if (hasta) {
        where.createdAt.lte = new Date(hasta);
      }
    }

    return prisma.ticket.findMany({

      where,

      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),

      include: {
        cliente: true,
        agente: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // ✅ Obtener ticket por ID
  static async getTicketById(id: number) {

    return prisma.ticket.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        cliente: true,
        agente: true,
      },
    });
  }

  // ✅ Actualizar ticket con reglas de negocio
  static async updateTicket(
    id: number,
    data: Prisma.TicketUncheckedUpdateInput
  ) {

    const ticket = await prisma.ticket.findFirst({
      where: {
        id,
        deletedAt: null
      }
    });

    if (!ticket) {
      throw new Error("Ticket no encontrado");
    }

    // 🔥 VALIDAR FLUJO DE ESTADOS (MAQUINA DE ESTADOS)
  const transicionesValidas: Record<TicketStatus, TicketStatus[]> = {
  ABIERTO: [TicketStatus.EN_PROGRESO],
  EN_PROGRESO: [TicketStatus.RESUELTO],
  RESUELTO: [TicketStatus.CERRADO],
  CERRADO: [],
  ESCALADO: [TicketStatus.EN_PROGRESO]
};

    if (data.estado) {

      const estadoActual = ticket.estado;
const nuevoEstado = data.estado as TicketStatus;

const permitidos = transicionesValidas[estadoActual];

if (!permitidos.includes(nuevoEstado)) {
  throw new Error(
    `No puedes cambiar un ticket de ${estadoActual} a ${nuevoEstado}`
  );
}
    }

    // 🔥 VALIDAR NIVEL DEL AGENTE
    if (data.agenteId) {

      const agente = await prisma.agente.findUnique({
        where: { id: Number(data.agenteId) }
      });

      if (!agente) {
        throw new Error("Agente no existe");
      }

      if (ticket.estado === "ESCALADO" && agente.nivel === 1) {
        throw new Error("Un agente nivel 1 no puede tomar tickets escalados");
      }
    }

    // 🔥 CALCULAR TIEMPO DE RESOLUCIÓN
    if (data.estado === TicketStatus.RESUELTO && !ticket.fechaResolucion) {

      const ahora = new Date();

      const minutos = Math.floor(
        (ahora.getTime() - ticket.createdAt.getTime()) / (1000 * 60)
      );

      data.fechaResolucion = ahora;
      data.tiempoResolucion = minutos;
    }

    return prisma.ticket.update({
      where: { id },
      data,
      include: {
        cliente: true,
        agente: true,
      }
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

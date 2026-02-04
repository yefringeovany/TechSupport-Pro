import cron from "node-cron";
import { prisma } from "../config/prisma.js";
import { TicketStatus } from "@prisma/client";

// Cron que corre cada minuto para revisar tickets
cron.schedule("*/5 * * * *", async () => {

  console.log("Ejecutando revisión automática de tickets...");

  try {

    // 🔹 Tiempos de producción
    const hace2Horas = new Date(Date.now() - 2 * 60 * 60 * 1000); // VIP 2 horas
    const hace24Horas = new Date(Date.now() - 24 * 60 * 60 * 1000); // NORMAL 24 horas
    

    // ===============================
    // ✅ ESCALAR TICKETS VIP
    // ===============================
    const escalados = await prisma.ticket.updateMany({
      where: {
        deletedAt: null,
        estado: TicketStatus.ABIERTO,
        createdAt: { lte: hace2Horas },
        cliente: { tipo: "VIP" }
      },
      data: {
        estado: TicketStatus.ESCALADO,
        nivelEscalamiento: 2
      }
    });

    if (escalados.count > 0) {
      console.log(`🚨 Tickets VIP escalados automáticamente: ${escalados.count}`);
    }

    // ===============================
    // ✅ NOTIFICAR TICKETS NORMALES
    // ===============================
    const normales = await prisma.ticket.findMany({
      where: {
        deletedAt: null,
        estado: TicketStatus.ABIERTO,
        createdAt: { lte: hace24Horas },
        cliente: { tipo: "NORMAL" }
      },
      select: {
        id: true,
        createdAt: true
      }
    });

    if (normales.length > 0) {
      console.log(`⚠️ ${normales.length} tickets normales sin atender por más de 5 minutos`);
      normales.forEach(ticket => {
        console.log(`📢 Notificar supervisor -> Ticket ID: ${ticket.id}`);
      });
    }

  } catch (error) {
    console.error("❌ Error en cron de tickets:", error);
  }

});

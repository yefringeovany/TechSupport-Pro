import cron from "node-cron";
import { prisma } from "../config/prisma.js";
import { TicketStatus } from "@prisma/client";
import { logInfo, logWarn, logError } from "../utils/logger.js";

// CRON cada 1 minuto
cron.schedule("* * * * *", async () => {

  logInfo("Ejecutando revisión automática de tickets...");

  try {

    // TIEMPOS 
    const hace2Horas = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const hace24Horas = new Date(Date.now() - 24 * 60 * 60 * 1000);


    // ESCALAR VIP (2 HORAS)
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
      logWarn(" Tickets VIP escalados automáticamente", {
        total: escalados.count
      });
    }

    
    //NORMALES SUPERVISOR (24H)
    const normales = await prisma.ticket.findMany({
      where: {
        deletedAt: null,
        estado: TicketStatus.ABIERTO,
        createdAt: { lte: hace24Horas },
        cliente: { tipo: "NORMAL" }
      },
      select: { id: true }
    });

    if (normales.length > 0) {

      const ids = normales.map(t => t.id);

      logWarn(" Tickets normales sin atender — notificar supervisor", {
        total: ids.length,
        ticketIds: ids
      });
    }

  } catch (error) {

    logError(" Error en cron de tickets", error);

  }

});

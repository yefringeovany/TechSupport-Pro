import cron from "node-cron";
import { prisma } from "../config/prisma.js";

cron.schedule("*/5 * * * *", async () => {

  console.log("Revisando tickets...");

  const hace2Horas = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const hace24Horas = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // VIP → ESCALAR
  await prisma.ticket.updateMany({
    where: {
      estado: "ABIERTO",
      createdAt: { lte: hace2Horas },
      cliente: {
        tipo: "VIP"
      }
    },
    data: {
      estado: "ESCALADO",
      nivelEscalamiento: 2
    }
  });

  // NORMAL → log supervisor
  const normales = await prisma.ticket.findMany({
    where: {
      estado: "ABIERTO",
      createdAt: { lte: hace24Horas },
      cliente: {
        tipo: "NORMAL"
      }
    }
  });

  normales.forEach(t =>
    console.log(`Notificar supervisor: Ticket ${t.id}`)
  );

});

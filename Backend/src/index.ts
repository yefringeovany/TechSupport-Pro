import express from 'express';
import { connectDatabases } from './config/database.config.js';

const app = express();

const PORT = 3000;

import ticketsRoutes from "./modules/tickets/tickets.routes.js"




app.use("/api/tickets", ticketsRoutes);
/**
 * Arranque del servidor
 */
const startServer = async () => {
  try {

    console.log("Iniciando conexión a las bases de datos...");

    await connectDatabases();

    console.log("Bases de datos conectadas");

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Error arrancando el servidor:", error);
    process.exit(1);
  }
};

startServer();

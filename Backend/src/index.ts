import express from 'express';
import { connectDatabases } from './config/database.config.js';
import "./cron/tickets.cron.js";


const app = express();

const PORT = 3000;

import ticketsRoutes from "./modules/tickets/tickets.routes.js"
import clientesRoutes from "./modules/clients/clientes.routes.js"

app.use(express.json());


app.use("/api/tickets", ticketsRoutes);
app.use("/api/clientes", clientesRoutes);
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

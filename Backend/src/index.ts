import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { connectDatabases } from './config/database.config.js';
import "./config/env.js";

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * ===============================
 * MIDDLEWARES
 * ===============================
 */

app.use(helmet());
app.use(cors());
app.use(compression());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: {
    error: 'Demasiadas solicitudes, intente de nuevo en un minuto'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/**
 * ===============================
 * ROUTES
 * ===============================
 */

import ticketsRoutes from "./modules/tickets/tickets.routes.js";
import clientesRoutes from "./modules/clients/clientes.routes.js";
import agentesRoutes from "./modules/agents/agentes.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";

app.use("/api/tickets", ticketsRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/agentes", agentesRoutes);
app.use("/api/auth", authRoutes);

/**
 * ===============================
 * HEALTH CHECK
 * ===============================
 */

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * ===============================
 * ERROR HANDLER
 * ===============================
 */

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
});

/**
 * ===============================
 * START SERVER
 * ===============================
 */

const startServer = async () => {
  try {

    console.log("Iniciando conexión a las bases de datos...");

    await connectDatabases();

    console.log("Bases de datos conectadas");

    
    await import("./cron/tickets.cron.js");

    console.log("Cron jobs iniciados");

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Error arrancando el servidor:", error);
    process.exit(1);
  }
};

startServer();

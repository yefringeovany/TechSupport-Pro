import { Router } from "express";
import { AgentesController } from "./agentes.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { authorizeRoles } from "../../middlewares/authorizeRoles.js";

const router = Router();
const controller = new AgentesController();

// Todas las rutas requieren autenticacion
router.use(verifyToken);

// Obtener todos los agentes
router.get("/", authorizeRoles("ADMIN", "SUPERVISOR"), controller.getAll.bind(controller));

// Obtener agente por ID
router.get("/:id", authorizeRoles("ADMIN", "SUPERVISOR", "AGENTE"), controller.getById.bind(controller));

// Crear agente - Solo Admin
router.post("/", authorizeRoles("ADMIN"), controller.create.bind(controller));

// Actualizar agente - Solo Admin y Supervisor
router.put("/:id", authorizeRoles("ADMIN", "SUPERVISOR"), controller.update.bind(controller));

// Eliminar agente - Solo Admin
router.delete("/:id", authorizeRoles("ADMIN"), controller.delete.bind(controller));

export default router;

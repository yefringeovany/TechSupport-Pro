import { Router } from "express";
import { TicketsController } from "./tickets.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { authorizeRoles } from "../../middlewares/authorizeRoles.js";
import { validateTicket, validateTicketUpdate } from "./tickets.validators.js";

const router = Router();

// Todas las rutas requieren autenticacion
router.use(verifyToken);

// Crear ticket - Admin, Supervisor y Agente pueden crear
router.post("/", authorizeRoles("ADMIN", "SUPERVISOR", "AGENTE"), validateTicket, TicketsController.create);

// Obtener todos los tickets - Admin y Supervisor ven todos, Agente solo los suyos
router.get("/", authorizeRoles("ADMIN", "SUPERVISOR", "AGENTE"), TicketsController.getAll);

// Obtener ticket por ID
router.get("/:id", authorizeRoles("ADMIN", "SUPERVISOR", "AGENTE"), TicketsController.getById);

// Actualizar ticket
router.put("/:id", authorizeRoles("ADMIN", "SUPERVISOR", "AGENTE"), validateTicketUpdate, TicketsController.update);

// Eliminar ticket (soft delete) - Solo Admin y Supervisor
router.delete("/:id", authorizeRoles("ADMIN", "SUPERVISOR"), TicketsController.delete);

// Asignar ticket a agente - Solo Admin y Supervisor
router.put("/:id/asignar", authorizeRoles("ADMIN", "SUPERVISOR"), TicketsController.asignar);

// Resolver ticket - Todos los roles autenticados
router.put("/:id/resolver", authorizeRoles("ADMIN", "SUPERVISOR", "AGENTE"), TicketsController.resolver);

export default router;

import { Router } from "express";
import { ClientesController } from "../clients/clientes.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { authorizeRoles } from "../../middlewares/authorizeRoles.js";

const router = Router();

// Todas las rutas requieren autenticacion
router.use(verifyToken);

// Crear cliente - Solo Admin y Supervisor
router.post("/", authorizeRoles("ADMIN", "SUPERVISOR"), ClientesController.create);

// Obtener todos los clientes
router.get("/", authorizeRoles("ADMIN", "SUPERVISOR", "AGENTE"), ClientesController.getAll);

// Obtener cliente por ID
router.get("/:id", authorizeRoles("ADMIN", "SUPERVISOR", "AGENTE"), ClientesController.getById);

// Actualizar cliente - Solo Admin y Supervisor
router.put("/:id", authorizeRoles("ADMIN", "SUPERVISOR"), ClientesController.update);

// Eliminar cliente - Solo Admin
router.delete("/:id", authorizeRoles("ADMIN"), ClientesController.delete);

export default router;

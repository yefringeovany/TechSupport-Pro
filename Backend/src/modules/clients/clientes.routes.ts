import { Router } from "express";
import { ClientesController } from "../clients/clientes.controller.js";

const router = Router();

router.post("/", ClientesController.create);
router.get("/", ClientesController.getAll);
router.get("/:id", ClientesController.getById);
router.put("/:id", ClientesController.update);
router.delete("/:id", ClientesController.delete);

export default router;

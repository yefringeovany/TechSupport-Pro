import { Router } from "express";
import { TicketsController } from "./tickets.controller.js";

const router = Router();

router.post("/", TicketsController.create);
router.get("/", TicketsController.getAll);
router.get("/:id", TicketsController.getById);
router.put("/:id", TicketsController.update);
router.delete("/:id", TicketsController.delete);
router.put("/:id/asignar", TicketsController.asignar);
router.put("/:id/resolver", TicketsController.resolver);

export default router;

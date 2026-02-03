import { Router } from "express";
import { TicketsController } from "./tickets.controller.js";

const router = Router();

router.post("/", TicketsController.create);
router.get("/", TicketsController.getAll);
router.get("/:id", TicketsController.getById);
router.put("/:id", TicketsController.update);
router.delete("/:id", TicketsController.delete);

export default router;

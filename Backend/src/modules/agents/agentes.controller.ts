import type { Request, Response } from "express";
import { AgentesService } from "./agentes.service.js";

const agentesService = new AgentesService();

export class AgentesController {
  async getAll(req: Request, res: Response) {
    try {
      const agentes = await agentesService.getAll();
      res.json(agentes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const agente = await agentesService.getById(id);
      if (!agente) return res.status(404).json({ message: "Agente no encontrado" });
      res.json(agente);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { nombre, email, nivel, activo } = req.body;
      const nuevoAgente = await agentesService.create({ nombre, email, nivel, activo });
      res.status(201).json(nuevoAgente);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const data = req.body;
      const agente = await agentesService.update(id, data);
      res.json(agente);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const agente = await agentesService.delete(id);
      res.json({ message: "Agente desactivado", agente });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

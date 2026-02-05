import type { Request, Response } from "express";
import { TicketsService } from "./tickets.service.js";

export class TicketsController {

  static async create(req: Request, res: Response) {
    try {
      const ticket = await TicketsService.createTicket(req.body);
      res.status(201).json(ticket);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Error creando ticket" });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const tickets = await TicketsService.getTickets(req.query);
      res.json(tickets);
    } catch (error: any) {
      res.status(500).json({ message: "Error obteniendo tickets" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const ticket = await TicketsService.getTicketById(id);
      if (!ticket) return res.status(404).json({ message: "Ticket no encontrado" });
      res.json(ticket);
    } catch (error: any) {
      res.status(500).json({ message: "Error obteniendo ticket" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const ticket = await TicketsService.updateTicket(id, req.body);
      res.json(ticket);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await TicketsService.deleteTicket(id);
      res.json({ message: "Ticket eliminado" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // Asignar ticket a agente
  static async asignar(req: Request, res: Response) {
    try {
      const ticketId = Number(req.params.id);
      const { agenteId } = req.body;
      if (!agenteId) return res.status(400).json({ message: "Debes enviar agenteId" });
      const ticket = await TicketsService.asignarTicket(ticketId, agenteId);
      res.json(ticket);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // Resolver ticket
  static async resolver(req: Request, res: Response) {
    try {
      const ticketId = Number(req.params.id);
      const ticket = await TicketsService.resolverTicket(ticketId);
      res.json(ticket);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

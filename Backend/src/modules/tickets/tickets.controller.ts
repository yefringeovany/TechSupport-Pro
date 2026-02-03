import type { Request, Response } from "express";
import { TicketsService } from "../tickets/tickets.service.js";

export class TicketsController {

  static async create(req: Request, res: Response) {
    try {
      const ticket = await TicketsService.createTicket(req.body);
      res.status(201).json(ticket);
    } catch (error) {
      res.status(500).json({ message: "Error creando ticket" });
    }
  }

  static async getAll(req: Request, res: Response) {
    const tickets = await TicketsService.getTickets();
    res.json(tickets);
  }

  static async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const ticket = await TicketsService.getTicketById(id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket no encontrado" });
    }

    res.json(ticket);
  }

  static async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const ticket = await TicketsService.updateTicket(id, req.body);
    res.json(ticket);
  }

  static async delete(req: Request, res: Response) {
    const id = Number(req.params.id);
    await TicketsService.deleteTicket(id);
    res.json({ message: "Ticket eliminado" });
  }
}

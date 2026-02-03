import type { Request, Response } from "express";
import { ClientesService } from "../../modules/clients/clientes.service.js";

export class ClientesController {

  static async create(req: Request, res: Response) {
    try {
      const cliente = await ClientesService.createCliente(req.body);
      res.status(201).json(cliente);

    } catch (error) {

      res.status(400).json({
        message: error instanceof Error ? error.message : "Error creando cliente"
      });
    }
  }

  static async getAll(req: Request, res: Response) {
    const clientes = await ClientesService.getClientes();
    res.json(clientes);
  }

  static async getById(req: Request, res: Response) {

    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID inválido"
      });
    }

    const cliente = await ClientesService.getClienteById(id);

    if (!cliente) {
      return res.status(404).json({
        message: "Cliente no encontrado"
      });
    }

    res.json(cliente);
  }

  static async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const cliente = await ClientesService.updateCliente(id, req.body);
    res.json(cliente);
  }

  static async delete(req: Request, res: Response) {
    const id = Number(req.params.id);
    await ClientesService.deleteCliente(id);
    res.json({
      message: "Cliente eliminado"
    });
  }
}

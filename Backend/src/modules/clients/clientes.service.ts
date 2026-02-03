import { prisma } from '../../config/prisma.js';

export class ClientesService {

  static async createCliente(data: any) {

    // validar email duplicado
    const existe = await prisma.cliente.findUnique({
      where: { email: data.email }
    });

    if (existe) {
      throw new Error("El cliente ya está registrado");
    }

    return prisma.cliente.create({
      data
    });
  }

  static async getClientes() {
    return prisma.cliente.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  static async getClienteById(id: number) {
    return prisma.cliente.findUnique({
      where: { id }
    });
  }

  static async updateCliente(id: number, data: any) {
    return prisma.cliente.update({
      where: { id },
      data
    });
  }

  static async deleteCliente(id: number) {
    return prisma.cliente.delete({
      where: { id }
    });
  }
}

import { PrismaClient, TipoCliente, RolUsuario } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de la base de datos...');

  // Crear Clientes
  const clienteVIP = await prisma.cliente.upsert({
    where: { email: 'contacto@banconacional.com' },
    update: {},
    create: {
      nombre: 'Banco Nacional S.A.',
      email: 'contacto@banconacional.com',
      tipo: TipoCliente.VIP,
      empresa: 'Grupo Financiero Nacional'
    }
  });

  const clienteVIP2 = await prisma.cliente.upsert({
    where: { email: 'soporte@techcorp.com' },
    update: {},
    create: {
      nombre: 'TechCorp Internacional',
      email: 'soporte@techcorp.com',
      tipo: TipoCliente.VIP,
      empresa: 'TechCorp Holdings'
    }
  });

  const clienteNormal = await prisma.cliente.upsert({
    where: { email: 'info@tiendaxyz.com' },
    update: {},
    create: {
      nombre: 'Tienda XYZ',
      email: 'info@tiendaxyz.com',
      tipo: TipoCliente.NORMAL,
      empresa: 'Comercializadora XYZ'
    }
  });

  const clienteNormal2 = await prisma.cliente.upsert({
    where: { email: 'contacto@empresaabc.com' },
    update: {},
    create: {
      nombre: 'Empresa ABC',
      email: 'contacto@empresaabc.com',
      tipo: TipoCliente.NORMAL,
      empresa: 'Grupo ABC'
    }
  });

  console.log('Clientes creados:', { clienteVIP, clienteVIP2, clienteNormal, clienteNormal2 });

  // Crear Agentes
  const agenteNivel1 = await prisma.agente.upsert({
    where: { email: 'carlos.lopez@techsupport.com' },
    update: {},
    create: {
      nombre: 'Carlos Lopez',
      email: 'carlos.lopez@techsupport.com',
      nivel: 1,
      activo: true
    }
  });

  const agenteNivel2 = await prisma.agente.upsert({
    where: { email: 'maria.garcia@techsupport.com' },
    update: {},
    create: {
      nombre: 'Maria Garcia',
      email: 'maria.garcia@techsupport.com',
      nivel: 2,
      activo: true
    }
  });

  const agenteNivel3 = await prisma.agente.upsert({
    where: { email: 'roberto.senior@techsupport.com' },
    update: {},
    create: {
      nombre: 'Roberto Senior',
      email: 'roberto.senior@techsupport.com',
      nivel: 3,
      activo: true
    }
  });

  console.log('Agentes creados:', { agenteNivel1, agenteNivel2, agenteNivel3 });

  // Crear Usuarios
  const passwordHash = await bcrypt.hash('admin123', 10);

  const userAdmin = await prisma.user.upsert({
    where: { email: 'admin@techsupport.com' },
    update: {},
    create: {
      email: 'admin@techsupport.com',
      password: passwordHash,
      rol: RolUsuario.ADMIN
    }
  });

  const supervisorHash = await bcrypt.hash('supervisor123', 10);
  const userSupervisor = await prisma.user.upsert({
    where: { email: 'supervisor@techsupport.com' },
    update: {},
    create: {
      email: 'supervisor@techsupport.com',
      password: supervisorHash,
      rol: RolUsuario.SUPERVISOR
    }
  });

  const agenteHash = await bcrypt.hash('agente123', 10);
  const userAgente = await prisma.user.upsert({
    where: { email: 'agente@techsupport.com' },
    update: {},
    create: {
      email: 'agente@techsupport.com',
      password: agenteHash,
      rol: RolUsuario.AGENTE,
      agenteId: agenteNivel2.id
    }
  });

  console.log('Usuarios creados:', { userAdmin, userSupervisor, userAgente });

  // Crear tickets de ejemplo
  const ticket1 = await prisma.ticket.create({
    data: {
      titulo: 'Error en sistema de facturacion',
      descripcion: 'El sistema no permite generar facturas desde esta manana. Muestra error 500 al intentar guardar.',
      clienteId: clienteVIP.id,
      prioridad: 'ALTA'
    }
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      titulo: 'Problema con acceso a plataforma',
      descripcion: 'Los usuarios no pueden iniciar sesion en la plataforma web. El sistema muestra credenciales invalidas.',
      clienteId: clienteNormal.id,
      prioridad: 'MEDIA'
    }
  });

  const ticket3 = await prisma.ticket.create({
    data: {
      titulo: 'Solicitud de nuevo modulo',
      descripcion: 'Se requiere implementar un nuevo modulo de reportes para el area de finanzas.',
      clienteId: clienteVIP2.id,
      prioridad: 'ALTA',
      agenteId: agenteNivel2.id,
      estado: 'EN_PROGRESO'
    }
  });

  console.log('Tickets creados:', { ticket1, ticket2, ticket3 });

  console.log('Seed completado exitosamente!');
  console.log('');
  console.log('=== Credenciales de prueba ===');
  console.log('Admin:      admin@techsupport.com / admin123');
  console.log('Supervisor: supervisor@techsupport.com / supervisor123');
  console.log('Agente:     agente@techsupport.com / agente123');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

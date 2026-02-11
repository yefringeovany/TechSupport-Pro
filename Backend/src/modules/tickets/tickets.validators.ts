import type { Request, Response, NextFunction } from 'express';

// Validar creacion de ticket
export const validateTicket = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { titulo, descripcion, clienteId } = req.body;

  const errors: string[] = [];

  // Validar titulo
  if (!titulo || typeof titulo !== 'string') {
    errors.push('El titulo es requerido y debe ser un texto');
  } else if (titulo.trim().length < 3) {
    errors.push('El titulo debe tener al menos 3 caracteres');
  } else if (titulo.length > 200) {
    errors.push('El titulo no puede superar los 200 caracteres');
  }

  // Validar descripcion
  if (!descripcion || typeof descripcion !== 'string') {
    errors.push('La descripcion es requerida y debe ser un texto');
  } else if (descripcion.trim().length < 10) {
    errors.push('La descripcion debe tener al menos 10 caracteres');
  }

  if (!clienteId || typeof clienteId !== 'number') {
    errors.push('El clienteId es requerido y debe ser un numero');
  }

  // Validar prioridad 
  if (req.body.prioridad) {
    const validPriorities = ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'];
    if (!validPriorities.includes(req.body.prioridad)) {
      errors.push(`La prioridad debe ser una de: ${validPriorities.join(', ')}`);
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  next();
};

// Validar actualizacion de ticket
export const validateTicketUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { titulo, descripcion, prioridad, estado } = req.body;

  const errors: string[] = [];

  // Validar titulo
  if (titulo !== undefined) {
    if (typeof titulo !== 'string') {
      errors.push('El titulo debe ser un texto');
    } else if (titulo.trim().length < 3) {
      errors.push('El titulo debe tener al menos 3 caracteres');
    } else if (titulo.length > 200) {
      errors.push('El titulo no puede superar los 200 caracteres');
    }
  }

  // Validar descripcion 
  if (descripcion !== undefined) {
    if (typeof descripcion !== 'string') {
      errors.push('La descripcion debe ser un texto');
    } else if (descripcion.trim().length < 10) {
      errors.push('La descripcion debe tener al menos 10 caracteres');
    }
  }

  // Validar prioridad (si viene)
  if (prioridad !== undefined) {
    const validPriorities = ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'];
    if (!validPriorities.includes(prioridad)) {
      errors.push(`La prioridad debe ser una de: ${validPriorities.join(', ')}`);
    }
  }

  // Validar estado 
  if (estado !== undefined) {
    const validStatuses = ['ABIERTO', 'EN_PROGRESO', 'RESUELTO', 'CERRADO', 'ESCALADO'];
    if (!validStatuses.includes(estado)) {
      errors.push(`El estado debe ser uno de: ${validStatuses.join(', ')}`);
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  next();
};

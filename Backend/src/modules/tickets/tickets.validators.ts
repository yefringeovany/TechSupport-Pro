import type { Request, Response, NextFunction } from 'express';

// ✅ Validar creación de ticket
export const validateCreateTicket = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { title, description } = req.body;

  const errors: string[] = [];

  // Validar title
  if (!title || typeof title !== 'string') {
    errors.push('El título es requerido y debe ser un texto');
  } else if (title.trim().length < 3) {
    errors.push('El título debe tener al menos 3 caracteres');
  } else if (title.length > 200) {
    errors.push('El título no puede superar los 200 caracteres');
  }

  // Validar description
  if (!description || typeof description !== 'string') {
    errors.push('La descripción es requerida y debe ser un texto');
  } else if (description.trim().length < 10) {
    errors.push('La descripción debe tener al menos 10 caracteres');
  }

  // Validar priority (opcional)
  if (req.body.priority) {
    const validPriorities = ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'];
    if (!validPriorities.includes(req.body.priority)) {
      errors.push(`La prioridad debe ser una de: ${validPriorities.join(', ')}`);
    }
  }

  // Validar status (opcional)
  if (req.body.status) {
    const validStatuses = ['ABIERTO', 'EN_PROGRESO', 'RESUELTO', 'CERRADO'];
    if (!validStatuses.includes(req.body.status)) {
      errors.push(`El estado debe ser uno de: ${validStatuses.join(', ')}`);
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  next();
};

// ✅ Validar actualización de ticket
export const validateUpdateTicket = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { title, description, priority, status } = req.body;

  const errors: string[] = [];

  // Al menos un campo debe venir
  if (!title && !description && !priority && !status) {
    errors.push('Debe proporcionar al menos un campo para actualizar');
  }

  // Validar title (si viene)
  if (title !== undefined) {
    if (typeof title !== 'string') {
      errors.push('El título debe ser un texto');
    } else if (title.trim().length < 3) {
      errors.push('El título debe tener al menos 3 caracteres');
    } else if (title.length > 200) {
      errors.push('El título no puede superar los 200 caracteres');
    }
  }

  // Validar description (si viene)
  if (description !== undefined) {
    if (typeof description !== 'string') {
      errors.push('La descripción debe ser un texto');
    } else if (description.trim().length < 10) {
      errors.push('La descripción debe tener al menos 10 caracteres');
    }
  }

  // Validar priority (si viene)
  if (priority !== undefined) {
    const validPriorities = ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'];
    if (!validPriorities.includes(priority)) {
      errors.push(`La prioridad debe ser una de: ${validPriorities.join(', ')}`);
    }
  }

  // Validar status (si viene)
  if (status !== undefined) {
    const validStatuses = ['ABIERTO', 'EN_PROGRESO', 'RESUELTO', 'CERRADO'];
    if (!validStatuses.includes(status)) {
      errors.push(`El estado debe ser uno de: ${validStatuses.join(', ')}`);
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  next();
};
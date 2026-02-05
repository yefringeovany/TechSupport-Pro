import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js"; // Asegúrate que la ruta sea correcta

interface JwtPayload {
  userId: number;
  rol: string;
  agenteId?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Token requerido",
    });
  }

  // Obtenemos el token separando "Bearer <token>"
  const token = authHeader.split(" ")[1];

  // CORRECCIÓN: Validamos que el token realmente exista
  if (!token) {
    return res.status(401).json({
      message: "Formato de token inválido",
    });
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as unknown as JwtPayload;

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido",
    });
  }
};
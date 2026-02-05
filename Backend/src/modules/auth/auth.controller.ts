import type { Request, Response } from "express";
import { AuthService } from "../auth/auth.service.js";

export class AuthController {

  static async register(req: Request, res: Response) {
    try {
      const user = await AuthService.register(req.body);

      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({
        message: error.message,
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const tokens = await AuthService.login(email, password);

      res.json(tokens);
    } catch (error: any) {
      res.status(401).json({
        message: error.message,
      });
    }
  }

  static async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      const token = await AuthService.refresh(refreshToken);

      res.json(token);
    } catch (error: any) {
      res.status(401).json({
        message: error.message,
      });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const result = await AuthService.logout(req.user!.userId);

      res.json(result);
    } catch (error: any) {
      res.status(400).json({
        message: error.message,
      });
    }
  }
}

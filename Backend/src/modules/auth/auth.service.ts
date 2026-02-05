import { prisma } from "../../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ENV } from "../../config/env.js";

export class AuthService {

  static async register(data: any) {
    const { email, password, rol, agenteId } = data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("El usuario ya existe");
    }

    if (rol === "AGENTE" && !agenteId) {
      throw new Error("Un usuario AGENTE debe tener agenteId");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        rol,
        agenteId,
      },
    });

    return user;
  }

  static async login(email: string, password: string) {

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Credenciales inválidas");
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      throw new Error("Credenciales inválidas");
    }

    const payload = {
      userId: user.id,
      rol: user.rol,
      agenteId: user.agenteId,
    };

    const accessToken = jwt.sign(
      payload,
      ENV.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      ENV.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return { accessToken, refreshToken };
  }

  static async refresh(token: string) {

    const decoded = jwt.verify(
      token,
      ENV.JWT_REFRESH_SECRET
    ) as { userId: number };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.refreshToken !== token) {
      throw new Error("Refresh token inválido");
    }

    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        rol: user.rol,
        agenteId: user.agenteId,
      },
      ENV.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return { accessToken: newAccessToken };
  }

  static async logout(userId: number) {

    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    return { message: "Logout exitoso" };
  }
}

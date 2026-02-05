import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Falta la variable de entorno: ${name}`);
  }

  return value;
}

export const ENV = {
  JWT_SECRET: requireEnv("JWT_SECRET") as string,
  JWT_REFRESH_SECRET: requireEnv("JWT_REFRESH_SECRET") as string,
};
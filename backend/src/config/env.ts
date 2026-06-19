import dotenv from 'dotenv';

dotenv.config();

function parsePort(value: string | undefined) {
  const parsed = Number(value ?? 4000);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('PORT precisa ser um número inteiro positivo.');
  }

  return parsed;
}

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} precisa estar configurado para iniciar a API.`);
  }

  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: parsePort(process.env.PORT),
  DATABASE_URL: requireEnv('DATABASE_URL')
};

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function parsePort(value) {
    const parsed = Number(value ?? 4000);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error('PORT precisa ser um número inteiro positivo.');
    }
    return parsed;
}
function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} precisa estar configurado para iniciar a API.`);
    }
    return value;
}
exports.env = {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    PORT: parsePort(process.env.PORT),
    DATABASE_URL: requireEnv('DATABASE_URL')
};

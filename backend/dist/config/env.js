"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./database");
dotenv_1.default.config();
function parsePort(value) {
    const parsed = Number(value ?? 4000);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error('PORT precisa ser um número inteiro positivo.');
    }
    return parsed;
}
const database = (0, database_1.getDatabaseConfig)();
exports.env = {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    PORT: parsePort(process.env.PORT),
    DATABASE_PROVIDER: database.provider,
    DATABASE_URL: database.url,
    DATABASE_SUPPORTED_PROVIDERS: database.supportedProviders,
    databaseProvider: database.provider,
    databaseUrl: database.url,
    databaseSupportedProviders: database.supportedProviders
};

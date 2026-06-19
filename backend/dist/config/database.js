"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseConfig = getDatabaseConfig;
const DEFAULT_PROVIDER = 'postgresql';
const SUPPORTED_PROVIDERS = [
    'postgresql',
    'mysql',
    'sqlserver',
    'sqlite',
    'cockroachdb'
];
function parseProvider(value) {
    if (!value) {
        return DEFAULT_PROVIDER;
    }
    if (SUPPORTED_PROVIDERS.includes(value)) {
        return value;
    }
    throw new Error(`DATABASE_PROVIDER inválido. Valores aceitos: ${SUPPORTED_PROVIDERS.join(', ')}.`);
}
function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} precisa estar configurado para iniciar a API.`);
    }
    return value;
}
function getDatabaseConfig() {
    return {
        provider: parseProvider(process.env.DATABASE_PROVIDER),
        url: requireEnv('DATABASE_URL'),
        supportedProviders: SUPPORTED_PROVIDERS
    };
}

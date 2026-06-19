type RelationalDatabaseProvider =
  | 'postgresql'
  | 'mysql'
  | 'sqlserver'
  | 'sqlite'
  | 'cockroachdb';

const DEFAULT_PROVIDER: RelationalDatabaseProvider = 'postgresql';
const SUPPORTED_PROVIDERS: RelationalDatabaseProvider[] = [
  'postgresql',
  'mysql',
  'sqlserver',
  'sqlite',
  'cockroachdb'
];

function parseProvider(value: string | undefined): RelationalDatabaseProvider {
  if (!value) {
    return DEFAULT_PROVIDER;
  }

  if ((SUPPORTED_PROVIDERS as string[]).includes(value)) {
    return value as RelationalDatabaseProvider;
  }

  throw new Error(
    `DATABASE_PROVIDER inválido. Valores aceitos: ${SUPPORTED_PROVIDERS.join(', ')}.`
  );
}

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} precisa estar configurado para iniciar a API.`);
  }

  return value;
}

export function getDatabaseConfig() {
  return {
    provider: parseProvider(process.env.DATABASE_PROVIDER),
    url: requireEnv('DATABASE_URL'),
    supportedProviders: SUPPORTED_PROVIDERS
  } as const;
}

export type { RelationalDatabaseProvider };

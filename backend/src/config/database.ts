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

function inferProviderFromUrl(url: string): RelationalDatabaseProvider | undefined {
  const protocol = url.match(/^([a-z0-9+.-]+):\/\//i)?.[1]?.toLowerCase();

  if (protocol === 'postgres' || protocol === 'postgresql') return 'postgresql';
  if (protocol === 'mysql') return 'mysql';
  if (protocol === 'sqlserver') return 'sqlserver';
  if (protocol === 'file') return 'sqlite';
  if (protocol === 'cockroachdb') return 'cockroachdb';

  return undefined;
}

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} precisa estar configurado para iniciar a API.`);
  }

  return value;
}

function applyTlsMode(url: string): string {
  if (process.env.DATABASE_TLS_MODE !== 'disabled') {
    return url;
  }

  return url.replace(/([;?])encrypt=true(?=;|&|$)/i, '$1encrypt=false');
}

export function getDatabaseConfig() {
  const url = applyTlsMode(requireEnv('DATABASE_URL'));

  return {
    provider: parseProvider(process.env.DATABASE_PROVIDER ?? inferProviderFromUrl(url)),
    url,
    supportedProviders: SUPPORTED_PROVIDERS
  } as const;
}

export type { RelationalDatabaseProvider };

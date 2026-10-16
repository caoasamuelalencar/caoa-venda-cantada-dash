import { spawn } from 'node:child_process';

const databaseNameByEnvironment = {
  development: 'salesdb_hml',
  homolog: 'salesdb_hml',
  production: 'salesdb'
};

function resolveApplicationEnvironment() {
  const value = process.env.APP_ENV ?? process.env.NODE_ENV;

  if (!value || value === 'development' || value === 'test') {
    return 'development';
  }

  if (value === 'homolog' || value === 'production') {
    return value;
  }

  throw new Error('APP_ENV inválido. Valores aceitos: development, homolog, production.');
}

function replaceSqlServerDatabase(url, databaseName) {
  if (!url.toLowerCase().startsWith('sqlserver://')) {
    return url;
  }

  if (url.includes('?')) {
    const [baseUrl, queryString = ''] = url.split('?');
    const params = new URLSearchParams(queryString);

    for (const key of Array.from(params.keys())) {
      const normalizedKey = key.replace(/[^a-z0-9]/gi, '').toLowerCase();
      if (normalizedKey === 'database' || normalizedKey === 'databasename') {
        params.delete(key);
      }
    }

    params.set('database', databaseName);
    return `${baseUrl}?${params.toString()}`;
  }

  const [baseUrl, ...segments] = url.split(';');
  const nextSegments = segments.filter((segment) => {
    const key = segment.trim().split('=', 1)[0]?.replace(/[^a-z0-9]/gi, '').toLowerCase();
    return key !== 'database' && key !== 'databasename';
  });

  return [baseUrl, `database=${databaseName}`, ...nextSegments].join(';');
}

const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error('Informe o comando que deve ser executado com a conexão do banco selecionada.');
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL precisa estar configurado para executar este comando.');
  process.exit(1);
}

const appEnvironment = resolveApplicationEnvironment();
const child = spawn(command, args, {
  cwd: process.cwd(),
  env: {
    ...process.env,
    APP_ENV: appEnvironment,
    DATABASE_URL: replaceSqlServerDatabase(
      databaseUrl,
      databaseNameByEnvironment[appEnvironment]
    )
  },
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

child.once('error', (error) => {
  console.error(error);
  process.exit(1);
});

child.once('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});

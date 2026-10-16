import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import dotenv from 'dotenv';

const environmentFile = resolve(process.cwd(), '.env.homolog');
const result = dotenv.config({ path: environmentFile, override: true });

if (result.error) {
  console.error(`Não foi possível carregar ${environmentFile}. Crie o arquivo local de homologação antes de executar este comando.`);
  process.exit(1);
}

const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error('Informe o comando que deve ser executado no ambiente de homologação.');
  process.exit(1);
}

const child = spawn(command, args, {
  cwd: process.cwd(),
  env: { ...process.env, NODE_ENV: 'production', APP_ENV: 'homolog' },
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

child.on('error', (error) => {
  console.error(error);
  process.exitCode = 1;
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exitCode = code ?? 1;
});

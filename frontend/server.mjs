import { createServer as createHttpServer } from 'node:http';
import { createServer as createHttpsServer } from 'node:https';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import next from 'next';

const port = Number(process.env.FRONTEND_PORT ?? 3003);
const hostname = process.env.FRONTEND_HOST ?? '0.0.0.0';
const tlsEnabled =
  (process.env.FRONTEND_TLS_ENABLED ?? process.env.TLS_ENABLED) === 'true';
const httpRedirectPort = Number(process.env.HTTP_REDIRECT_PORT ?? 80);

function readTlsOptions() {
  const certificatePath = resolve(
    process.cwd(),
    process.env.FRONTEND_TLS_CERT_PATH ?? process.env.TLS_CERT_PATH ?? ''
  );
  const keyPath = resolve(
    process.cwd(),
    process.env.FRONTEND_TLS_KEY_PATH ?? process.env.TLS_KEY_PATH ?? ''
  );

  if (!existsSync(certificatePath) || !existsSync(keyPath)) {
    throw new Error(
      'HTTPS exige caminhos validos para o certificado e a chave privada.'
    );
  }

  return {
    cert: readFileSync(certificatePath),
    key: readFileSync(keyPath),
    minVersion: 'TLSv1.2'
  };
}

const app = next({ dev: false, hostname, port });
const handler = app.getRequestHandler();

await app.prepare();

const server = tlsEnabled
  ? createHttpsServer(readTlsOptions(), handler)
  : createHttpServer(handler);

server.listen(port, hostname, () => {
  const protocol = tlsEnabled ? 'https' : 'http';
  console.log(`Frontend rodando em ${protocol}://localhost:${port}`);
});

if (tlsEnabled && httpRedirectPort !== port) {
  const redirectServer = createHttpServer((request, response) => {
    const requestHost = request.headers.host?.replace(/:\d+$/, '') || hostname;
    const targetPort = port === 443 ? '' : `:${port}`;
    response.writeHead(308, {
      Location: `https://${requestHost}${targetPort}${request.url ?? '/'}`
    });
    response.end();
  });

  redirectServer.listen(httpRedirectPort, hostname, () => {
    console.log(`Redirecionamento HTTP ativo na porta ${httpRedirectPort}`);
  });
}

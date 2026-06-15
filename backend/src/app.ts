import cors from 'cors';
import express, { json, Request, Response, NextFunction } from 'express';
import salesIntentionRoutes from './routes/salesIntentionRoutes';
import { getSwaggerHtml, openApiSpec } from './swagger';

const app = express();

app.use(cors());
app.use(json());
app.use('/sales-intentions', salesIntentionRoutes);
app.get('/openapi.json', (_req: Request, res: Response) => {
  res.json(openApiSpec);
});
app.get('/docs', (_req: Request, res: Response) => {
  res.type('html').send(getSwaggerHtml('/openapi.json'));
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Erro interno do servidor.' });
});

export default app;

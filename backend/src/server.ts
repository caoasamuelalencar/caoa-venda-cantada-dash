import dotenv from 'dotenv';
import app from './app';

dotenv.config();
dotenv.config({ path: '../.env.example' });

const PORT = Number(process.env.PORT ?? 4000);

app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});

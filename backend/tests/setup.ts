// A suíte de API substitui os serviços que acessariam o banco, mas a criação
// da aplicação ainda valida a configuração de conexão.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ??= 'sqlserver://localhost:1433;database=salesdb_hml;user=ci;password=ci;encrypt=false';
process.env.BACKEND_AUTH_SECRET ??= 'ci-test-secret';

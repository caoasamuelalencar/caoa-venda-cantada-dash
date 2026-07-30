import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const changanCatalog = {
  tipoVenda: 'NOVOS',
  bandeira: 'CAOA Changan',
  regional: 'A definir',
  lojaVenda: 'A definir',
  marcaVeiculo: 'CAOA Changan',
  versao: 'A definir',
  classificacao: 'Varejo'
};

async function main() {
  const existing = await prisma.salesIntentionCatalog.findFirst({
    where: {
      tipoVenda: changanCatalog.tipoVenda,
      bandeira: changanCatalog.bandeira,
      marcaVeiculo: changanCatalog.marcaVeiculo,
      versao: changanCatalog.versao
    }
  });

  if (existing) {
    console.log('O catálogo CAOA Changan já está cadastrado.');
    return;
  }

  await prisma.salesIntentionCatalog.create({ data: changanCatalog });
  console.log('Catálogo CAOA Changan cadastrado com sucesso.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

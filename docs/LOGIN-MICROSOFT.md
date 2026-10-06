# Autenticação Microsoft Entra ID

## Visão geral

O CAOA Venda Cantada Dash usa NextAuth com o provedor Microsoft Entra ID
(Azure AD) e sessão JWT. O login é iniciado em /login e, após a autenticação
no tenant configurado, o usuário retorna para a rota solicitada ou para
/sales-intention.

A configuração central fica em frontend/src/lib/nextAuth.ts. A rota do
NextAuth é frontend/src/app/api/auth/[...nextauth]/route.ts.

## Fluxo de autenticação

1. O usuário seleciona **Entrar com Microsoft** na página /login.
2. O Microsoft Entra ID autentica a conta e retorna para
   /api/auth/callback/azure-ad.
3. O NextAuth cria uma sessão JWT.
4. A aplicação monta um perfil de diretório com as claims do token e, quando
   disponível, dados complementares do Microsoft Graph.
5. As rotas de interface e o BFF usam essa sessão para decidir acesso e
   propagar uma identidade assinada ao backend.

O escopo solicitado é: openid, profile, email, offline_access e User.Read.

## Proteção de rotas

O middleware protege os grupos /dashboard, /relatorios, /sales-intention e
/configuracoes. Além disso, layouts de páginas internas verificam a sessão no
servidor. Operações administrativas são protegidas no BFF e no Express pela
role ADMIN; a interface apenas reflete essa autorização.

As rotas públicas principais são /login, /access-denied e /api/auth/*.

## Perfil do usuário

A sessão disponibiliza, quando fornecidos pelo tenant:

- nome, e-mail e identificador estável do usuário;
- foto opcional, servida pela rota /api/perfil/foto;
- claims do ID token;
- atributos corporativos obtidos do Microsoft Graph;
- gestor direto opcional, derivado de uma exportação configurada por AD_EXPORT_PATH.

O arquivo de exportação AD contém dados corporativos e não deve ser versionado.

## Autenticação temporária para homologação

O provedor de credenciais só é registrado se **as duas** variáveis estiverem
configuradas como true:

- NEXTAUTH_FALLBACK_AUTH=true
- NEXT_PUBLIC_FALLBACK_AUTH=true

Esse caminho é exclusivamente temporário para ambientes controlados. Em
produção, mantenha essas variáveis ausentes ou como false e use o Microsoft
Entra ID.

## Variáveis necessárias

- AZURE_AD_CLIENT_ID
- AZURE_AD_CLIENT_SECRET
- AZURE_AD_TENANT_ID
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- BACKEND_AUTH_SECRET

As credenciais e URIs de redirecionamento são detalhadas em
[AZURE_AD_SETUP.md](./AZURE_AD_SETUP.md). O contrato de autorização posterior
ao login está em [access-control.md](./access-control.md).

## Diagnóstico

- **Redirecionamento recusado:** confirme que a URI cadastrada no Entra ID é
  exatamente a URL pública seguida de /api/auth/callback/azure-ad.
- **Loop de login:** verifique NEXTAUTH_URL, NEXTAUTH_SECRET, domínio, HTTPS e
  cookies aceitos pelo navegador.
- **Acesso negado após login:** valide o usuário local, os perfis, as Regionais
  atribuídas e as permissões no banco.
- **Foto ausente:** a sessão continua válida; a imagem é opcional e depende do
  acesso ao Microsoft Graph.

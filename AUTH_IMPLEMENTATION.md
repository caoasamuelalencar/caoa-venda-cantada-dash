# Implementação de NextAuth com Microsoft Entra ID - Configuração Completa

## Visão Geral

Sua aplicação agora possui um sistema de autenticação completo e multi-método com:
- ✅ Integração Microsoft Entra ID (Azure AD)
- ✅ Login de conta local (para usuários existentes)
- ✅ Credenciais de teste para desenvolvimento
- ✅ Middleware de proteção de rotas
- ✅ Gerenciamento de sessão com JWT
- ✅ Restrição de domínio (`@caoa.com.br`)
- ✅ Tratamento de erros e fallbacks

## Arquitetura

### Arquivos Adicionados/Modificados

```
src/
├── lib/
│   └── nextAuth.ts                 # Configuração NextAuth com Azure AD + Credentials provider
├── app/
│   ├── api/
│   │   └── auth/[...nextauth]/
│   │       └── route.ts            # Manipulador de rota NextAuth
│   ├── login/
│   │   └── page.tsx                # UI atualizada com 3 métodos de autenticação
│   └── providers.tsx               # SessionProvider adicionado
├── hooks/
│   └── useCurrentUser.tsx           # Hook para acessar sessão do usuário
middleware.ts                        # Proteção de rotas
.env.local                          # Variáveis de ambiente (modelo)
AZURE_AD_SETUP.md                   # Guia de registro do app Azure
```

## Estado Atual

### Status do Servidor de Desenvolvimento
- **URL**: http://localhost:3003 (porta pode variar)
- **Ambiente**: Usando `.env.local` para configuração
- **Status**: ✅ Rodando e compilado

### Opções na Página de Login
A página de login (`/login`) agora oferece **três métodos de autenticação**:

1. **🔐 Entrar com Microsoft** (Botão no topo)
   - Redirecionamento OAuth direto para Azure AD
   - Requer credenciais Azure completas em `.env.local`
   - Restrito ao domínio `@caoa.com.br`

2. **Acesso Local** (Botão abaixo do divisor)
   - Usa o sistema de conta local existente
   - Login com usuário/senha
   - Usa cookie `caoa-auth` (sistema legado)

3. **Teste (Dev Only)** (Botão âmbar)
   - Para desenvolvimento/teste sem configuração do Azure
   - **Email**: test@caoa.com.br
   - **Senha**: test
   - Usa o provider Credentials do NextAuth
   - Cria uma sessão JWT do NextAuth

## Início Rápido

### 1. Testar Sem Configuração do Azure

Se você ainda não tem o Azure AD configurado:

1. Visite http://localhost:3003/login
2. Clique no botão **"Teste (Dev Only)"**
3. Clique em **"Entrar com Teste"**
4. Você estará logado como `test@caoa.com.br`
5. Acesse `/relatorios` e outras rotas protegidas

### 2. Configurar Microsoft Entra ID

Quando estiver pronto para integrar o Azure AD real:

1. Siga o guia passo a passo em [AZURE_AD_SETUP.md](./AZURE_AD_SETUP.md)
2. Atualize `.env.local` com suas credenciais:
   ```env
   NEXTAUTH_SECRET=<gerar-com-openssl-rand-base64-32>
   NEXTAUTH_URL=http://localhost:3003
   AZURE_AD_CLIENT_ID=seu-client-id
   AZURE_AD_CLIENT_SECRET=seu-client-secret
   AZURE_AD_TENANT_ID=seu-tenant-id
   ```
3. Reinicie o servidor de desenvolvimento

## Endpoints de API

### Rotas NextAuth
- `GET /api/auth/signin` - Redirecionamento para página de login
- `POST /api/auth/signin/azure-ad` - Iniciar login Azure AD
- `POST /api/auth/callback/azure-ad` - Callback do Azure AD
- `POST /api/auth/signin/credentials` - Login com provider Credentials
- `GET /api/auth/session` - Obter sessão atual
- `POST /api/auth/signout` - Fazer logout

### Rotas Protegidas (Middleware)
Requer autenticação (redireciona para `/login` se não autenticado):
- `/dashboard/*`
- `/relatorios/*`
- `/sales-intention/*`
- `/configuracoes/*`

### Rotas Públicas (Sem autenticação necessária)
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/api/auth/*`
- Arquivos estáticos (`/_next`, `/public`)

## Acessar Sessão do Usuário

### Em Componentes React (Cliente)

```typescript
"use client";
import useCurrentUser from "@/hooks/useCurrentUser";

export default function MeuComponente() {
  const { user, loading, authenticated } = useCurrentUser();

  if (loading) return <p>Carregando...</p>;
  if (!authenticated) return <p>Não autenticado</p>;

  return <p>Bem-vindo {user?.name}! ({user?.email})</p>;
}
```

### Em Componentes de Servidor / Rotas de API

```typescript
import { authOptions } from "@/lib/nextAuth";
import { getServerSession } from "next-auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  return Response.json({
    user: session.user,
    email: session.user?.email,
  });
}
```

## Variáveis de Ambiente Explicadas

| Variável | Obrigatória | Exemplo | Descrição |
|----------|----------|---------|-------------|
| `NEXTAUTH_SECRET` | Sim | String base64 de 32 caracteres | Segredo para assinar JWT. Gerar com `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Sim | http://localhost:3003 | URL da aplicação para redirecionamentos OAuth. Deve corresponder ao URI configurado |
| `AZURE_AD_CLIENT_ID` | Não* | xxxxxxxx-xxxx-... | ID do cliente do registro de app do Azure |
| `AZURE_AD_CLIENT_SECRET` | Não* | xxxxxxxx-... | Segredo do cliente do registro de app do Azure (VALOR, não ID) |
| `AZURE_AD_TENANT_ID` | Não* | xxxxxxxx-xxxx-... | ID do diretório/locatário do Azure (NÃO "v2.0" ou "common") |

*Obrigatório apenas se usar Azure AD. A app funciona com o provider Credentials se não estiver definido.

## Comportamento do Middleware

O middleware (`middleware.ts`) protege rotas verificando token JWT:

```
Requisição para Rota Protegida
         ↓
Middleware verifica token JWT válido
         ↓
   Token existe?
   /        \
 SIM        NÃO
  ↓          ↓
Passar    Redirecionar para /login
Através   (com parâmetro redirect)
```

## Restrição de Domínio

O callback de signIn do Azure AD força restrição de domínio:

```typescript
// Apenas emails @caoa.com.br permitidos
if (!userEmail.endsWith("@caoa.com.br")) {
  return false; // Login rejeitado
}
```

Domínios externos (ex: @gmail.com) são automaticamente rejeitados.

## Logout

### Logout Programático

```typescript
import { signOut } from "next-auth/react";

export function BotaoSair() {
  return (
    <button onClick={() => signOut({ redirect: "/login" })}>
      Sair
    </button>
  );
}
```

### Limpeza de Sessão
- JWT limpo dos cookies
- Usuário redirecionado para `/login`
- Cookie `caoa-auth` antigo (se existir) também deve ser limpo

## Solução de Problemas

### Avisos "NEXTAUTH_URL"
Aviso inofensivo. Defina `NEXTAUTH_URL` em `.env.local` para corrigir.

### Avisos "NO_SECRET"
Gere segredo com `openssl rand -base64 32` e adicione a `.env.local`.

### Não consegue fazer login com Microsoft
1. Verifique se `.env.local` tem credenciais corretas
2. Confirme que `AZURE_AD_TENANT_ID` NÃO é "v2.0" ou "common"
3. Valide se o URI de redirecionamento está registrado no Azure

### Redirecionamento não funcionando
1. Verifique as regras de matcher do middleware em `middleware.ts`
2. Garanta que a rota corresponde ao padrão (ex: `/relatorios/...`)
3. Limpe cookies do navegador e tente novamente

### Login de teste não funcionando
1. Certifique-se de não estar fornecendo credenciais do Azure (app retorna ao provider Credentials)
2. Email deve ser `test@caoa.com.br` e senha deve ser `test`

## Checklist de Testes

- [ ] Visite `/login` → Veja 3 botões (Microsoft, Local, Teste)
- [ ] Clique botão Teste → Faça login com test@caoa.com.br/test
- [ ] Acesse `/relatorios` → Deve ser acessível enquanto logado
- [ ] Faça logout → Deve redirecionar para `/login`
- [ ] Tente `/relatorios` sem autenticação → Deve redirecionar para `/login`
- [ ] Tente login Local → Deve funcionar com credenciais existentes
- [ ] Middleware redirecionando corretamente

## Próximos Passos

1. **Configurar Azure AD** (quando pronto)
   - Siga `AZURE_AD_SETUP.md`
   - Atualize `.env.local` com credenciais reais
   - Teste fluxo de login do Azure

2. **Adicionar UI de Logout**
   - Adicione botão de logout à navegação
   - Use `signOut()` do next-auth/react

3. **Customizar Callbacks**
   - Modifique enriquecimento de perfil do usuário
   - Adicione verificações de permissão/função
   - Sincronize usuários com banco de dados

4. **Deploy em Produção**
   - Defina `NEXTAUTH_SECRET` forte
   - Use `NEXTAUTH_URL=https://seudominio.com`
   - Configure URIs de redirecionamento de produção no Azure
   - Ative HTTPS apenas

## Links de Documentação

- [Documentação Next-Auth](https://next-auth.js.org/)
- [Provider Azure AD](https://next-auth.js.org/providers/azure-ad)
- [Middleware](https://next-auth.js.org/configuration/pages#middleware)
- [Sessão & JWT](https://next-auth.js.org/concepts/session-strategies)

---

## 📋 Informações do Registro de Aplicativo Azure

### Credenciais Principais



### Configurações de Conta

| Campo | Valor |
|-------|-------|
| **Tipos de Conta com Suporte** | Somente minha organização |
| **Estado** | ✅ Ativado |
| **Gerenciado em** | Diretório local - CAOA Venda Cantada Dash |

### Configuração de Redirecionamento

| Campo | Valor |
|-------|-------|
| **URIs de Redirecionamento** | 1 Web, 0 SPA, 0 cliente público |
| **URL de Callback** | `http://localhost:3003/api/auth/callback/azure-ad` |

### Segurança

| Campo | Status |
|-------|--------|
| **Credenciais de Cliente** | ⚠️ Pendente - Adicionar certificado ou segredo |
| **URI da ID do Aplicativo** | ⚠️ Pendente - Adicionar URI de ID do Aplicativo |

---

## 🔑 Próximas Ações Necessárias

### 1. Gerar Segredo do Cliente
- Vá para **Certificados e Segredos**
- Clique em **+ Novo segredo do cliente**
- Copie o valor e salve em `.env.local` como `AZURE_AD_CLIENT_SECRET`

### 2. Verificar Permissões de API
- Acesse **Permissões de API**
- Confirme se as seguintes estão adicionadas:
  - `User.Read`
  - `openid`
  - `profile`
  - `email`

### 3. Configurar `.env.local`

```env

```

### 4. Reiniciar o Servidor
```bash
pnpm run dev
```


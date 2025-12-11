# 📚 Biblioteca Pessoal & Pagamentos PIX

Este projeto foi desenvolvido como um desafio técnico, implementando um sistema de gerenciamento de biblioteca pessoal com autenticação e uma integração de pagamentos PIX.

## ✨ Tecnologias Utilizadas

| Categoria | Tecnologia | Descrição |
| :--- | :--- | :--- |
| **Framework** | Next.js 14+ (App Router) | Frontend e Backend (API Routes) |
| **Linguagem** | TypeScript | Tipagem estática para maior segurança |
| **Banco de Dados** | PostgreSQL | Gerenciado via **Supabase** |
| **ORM** | Prisma | ORM moderno para interação com o banco de dados |
| **Autenticação** | NextAuth.js | Sistema de login/registro seguro (Credentials Provider) |
| **Estilização** | Tailwind CSS | Framework CSS utilitário para design rápido e responsivo |
| **Validação** | Zod | Validação de schemas de dados (backend e frontend) |
| **Pagamentos** | API Externa | Integração com API de pagamentos PIX |

## 🚀 Funcionalidades

### 1. Gerenciamento de Biblioteca (CRUD)

*   **Registro e Login:** Sistema de autenticação seguro com senhas hasheadas (`bcryptjs`).
*   **Sessão:** Gerenciamento de sessão via JWT (JSON Web Tokens) com NextAuth.js.
*   **CRUD de Livros:**
    *   **C**riar: Adicionar novos livros à biblioteca.
    *   **R**ead: Listar e visualizar os livros do usuário.
    *   **U**pdate: Editar informações de livros existentes.
    *   **D**elete: Remover livros da biblioteca.
*   **Autorização:** Usuários só podem acessar e modificar seus próprios livros.

### 2. Integração de Pagamentos PIX

*   **API Route:** Rota de backend protegida para processar transações.
*   **Integração:** Simulação de chamada a uma API externa de pagamentos (Payevo).
*   **QR Code:** Geração e exibição do QR Code PIX para a transação.
*   **Segurança:** Chave da API de pagamento protegida no backend (variável de ambiente).

## ⚙️ Configuração Local (Supabase)

Siga os passos abaixo para configurar e rodar o projeto em sua máquina local.

### Pré-requisitos

*   Node.js (v18+)
*   pnpm (ou npm/yarn)

### 1. Clonar o Repositório

```bash
git clone https://github.com/PedroHenr1que1/project_x.git
cd project_x
```

### 2. Instalar Dependências

```bash
pnpm install
```

### 3. Configurar Variáveis de Ambiente

Crie o arquivo `.env` copiando o `.env.example`:

```bash
cp .env.example .env
```

Preencha as variáveis com seus dados. **Atenção à `DATABASE_URL` do Supabase.**

| Variável | Descrição | Valor de Exemplo |
| :--- | :--- | :--- |
| `DATABASE_URL` | String de conexão do seu banco de dados **Supabase** | `url-bancodedados` |
| `DIRECT_URL` | String de conexão do seu banco de dados **Supabase** | `url-direta` |
| `NEXTAUTH_URL` | URL da aplicação (vercel) | `https://project-x-five-psi.vercel.app` |
| `NEXTAUTH_SECRET` | Chave secreta para JWT (gere uma string longa e aleatória) | `sua-chave-secreta-aqui` |
| `PAYEVO_API_KEY` | Chave da API de Pagamento (simulada) | `sua-key-aqui` |

### 4. Aplicar Migrações do Prisma (Criar Tabelas)

Com a `DATABASE_URL` correta no `.env`, execute o comando para criar as tabelas no seu banco de dados do Supabase:

```bash
pnpm prisma migrate dev --name init
```

### 5. Iniciar o Servidor de Desenvolvimento

O servidor Next.js iniciará o Frontend e o Backend (API Routes) simultaneamente.

```bash
pnpm dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## ☁️ Deploy na Vercel

O projeto está configurado para ser facilmente deployado na Vercel.

### 1. Conectar Repositório

1.  Faça o push do seu código para um repositório no GitHub/GitLab/Bitbucket.
2.  Importe o projeto na Vercel.

### 2. Configurar Variáveis de Ambiente na Vercel

No painel de configurações do projeto na Vercel, adicione as seguintes variáveis de ambiente (em **Settings > Environment Variables**):

| Variável | Valor |
| :--- | :--- |
| `DATABASE_URL` | Sua string de conexão do Supabase (a mesma do `.env`) |
| `DIRECT_URL` | Sua string de conexão do Supabase (a mesma do `.env`) |
| `NEXTAUTH_URL` | A URL de produção do seu projeto na Vercel (Ex: `https://meu-projeto.vercel.app`) |
| `NEXTAUTH_SECRET` | A chave secreta gerada (a mesma do `.env`) |
| `PAYEVO_API_KEY` | A chave da API de Pagamento (a mesma do `.env`) |

### 3. Deploy

A Vercel detectará o projeto Next.js e fará o build e deploy automaticamente.

## ⚠️ Solução de Problemas (Prisma)

Se você encontrar o erro `SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce` em produção (Vercel), isso indica que o handshake de autenticação entre o Adapter Neon e o Pooler do Supabase falhou devido à concorrência ou codificação incorreta.

**Solução Rápida:** Ausência de Parâmetros de Estabilidade na URL (O driver WebSocket precisa de instruções claras para SSL). Garanta que a sua DATABASE_URL (porta 6543) esteja completa e robusta, incluindo SSL e PgBouncer: ?pgbouncer=true&sslmode=require.


---

*Desenvolvido como Desafio Técnico*

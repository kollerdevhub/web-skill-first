# 🎓 Skill First — Plataforma de Educação

Plataforma de educação online construída com **Next.js 16**, focada em gestão de cursos, vídeos e usuários com painel administrativo completo.

---

## ✨ Funcionalidades

- **Área do Aluno** — Dashboard com cursos disponíveis, progresso e reprodução de vídeos
- **Painel Admin** — Gerenciamento de cursos, vídeos, usuários e vagas
- **Criação de Cursos** — Wizard completo com upload de thumbnail e organização de módulos
- **Upload de Mídia** — Integração com Cloudinary para imagens e vídeos
- **Autenticação** — Login via Firebase (Google OAuth)
- **Responsivo** — Interface adaptada para desktop e mobile

---

## 🛠️ Tech Stack

| Camada        | Tecnologia                         |
| ------------- | ---------------------------------- |
| Framework     | Next.js 16 (App Router, Turbopack) |
| Linguagem     | TypeScript 5                       |
| Estilização   | Tailwind CSS 4                     |
| UI Components | Radix UI + shadcn/ui               |
| State/Data    | TanStack React Query v5            |
| Auth          | Firebase Authentication            |
| Mídia         | Cloudinary (next-cloudinary)       |
| Ícones        | Lucide React                       |

---

## 📁 Estrutura do Projeto

```
src/
├── app/                  # Rotas (App Router)
│   ├── admin/            # Painel administrativo
│   │   ├── cursos/       # CRUD de cursos
│   │   ├── usuarios/     # Gestão de usuários
│   │   ├── vagas/        # Gestão de vagas
│   │   └── videos/       # Gestão de vídeos
│   ├── dashboard/        # Área do aluno
│   ├── cursos/           # Página pública de cursos
│   ├── login/            # Autenticação
│   └── api/              # API Routes
├── components/           # Componentes reutilizáveis
├── hooks/                # Custom hooks
├── lib/                  # Utilitários e configurações
└── types/                # Definições de tipos TypeScript
```

---

## 🚀 Getting Started

### Pré-requisitos

- **Node.js** ≥ 18
- **npm** (ou yarn/pnpm)
- Conta no **Firebase** (para autenticação)
- Conta no **Cloudinary** (para uploads de mídia)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/koller-dev-hub/web-skill-first.git
cd web-skill-first

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz com base no `.env.example`:

```env
# Database
DATABASE_URL="file:./dev.db"

# Auth.js
AUTH_SECRET="sua-chave-secreta"
AUTH_GOOGLE_ID="seu-google-client-id"
AUTH_GOOGLE_SECRET="seu-google-client-secret"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="seu-cloud-name"
CLOUDINARY_API_KEY="sua-api-key"
CLOUDINARY_API_SECRET="seu-api-secret"
```

### Executando

```bash
# Desenvolvimento (porta 3002, Turbopack)
npm run dev

# Build de produção
npm run build

# Produção
npm start
```

Acesse [http://localhost:3002](http://localhost:3002) no navegador.

---

## 📜 Scripts Disponíveis

| Comando         | Descrição                     |
| --------------- | ----------------------------- |
| `npm run dev`   | Servidor de desenvolvimento   |
| `npm run build` | Build de produção             |
| `npm start`     | Inicia o servidor de produção |
| `npm run lint`  | Executa o ESLint              |

---

## 📄 Licença

Projeto privado — todos os direitos reservados.

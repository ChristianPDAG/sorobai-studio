# 🚀 SOROBAI STUDIO - Plan Maestro de Arquitectura

## Índice
1. [Visión General](#visión-general)
2. [Estado Actual](#estado-actual)
3. [Arquitectura de Carpetas](#arquitectura-de-carpetas)
4. [Schema de Base de Datos](#schema-de-base-de-datos)
5. [Fases de Desarrollo](#fases-de-desarrollo)
6. [Decisiones Técnicas](#decisiones-técnicas)
7. [Variables de Entorno](#variables-de-entorno)
8. [Dependencias](#dependencias)

---

## Visión General

Sorobai Studio es un IDE asistido por IA diseñado específicamente para el ecosistema Stellar/Soroban. La plataforma combina:

- **Editor de código** (Monaco) optimizado para Rust/Soroban
- **Asistente IA** (Gemini Flash 3) con RAG de documentación oficial
- **Hub Social** para compartir y auditar contratos
- **Marketplace de Bounties** con escrow en USDC
- **Sistema de créditos** basado en micro-pagos en Stellar

### Pilares Fundamentales

1. **Generación Inteligente**: IA que traduce lenguaje natural a código Soroban optimizado
2. **Educación Continua**: Explicaciones en tiempo real basadas en documentación oficial
3. **Comunidad**: Hub social con likes, forks y auditoría colectiva

---

## Estado Actual

### ✅ Ya Implementado
- Next.js 15 con App Router
- Supabase (auth + DB)
- Tailwind CSS + shadcn/ui
- Sistema i18n (inglés/español)
- TypeScript configurado

### 🔧 Parcialmente Implementado
- Estructura base de tipos (`/types/index.ts`)
- Constantes de configuración (`/lib/constants/index.ts`)
- Cliente Stellar básico (`/lib/stellar/`)
- Cliente IA básico (`/lib/ai/`)
- Hook de wallet (`/hooks/use-wallet.ts`)

### ❌ Pendiente
- Monaco Editor
- Chat de IA con streaming
- Sistema de créditos
- RAG con documentación
- Hub Social
- Bounties Marketplace
- Deploy a Soroban

---

## Arquitectura de Carpetas

```
/app
  /page.tsx                 # Landing page (marketing)
  /layout.tsx               # Root layout
  /auth/                    # Autenticación
    /login/page.tsx
    /sign-up/page.tsx
    /forgot-password/page.tsx
    /confirm/route.ts
  /(platform)               # Requiere autenticación
    /layout.tsx             # Platform layout con sidebar
    /studio/                # Core del IDE
      /page.tsx             # Lista de proyectos / nuevo
      /[projectId]/page.tsx # Editor con proyecto
    /dashboard/             # Perfil del usuario
      /page.tsx             # Créditos, stats, settings
    /hub/                   # Community Hub (Fase Beta)
      /page.tsx             # Explorar contratos
      /[contractId]/page.tsx
    /bounties/              # Marketplace (Fase v1.0)
      /page.tsx
      /[bountyId]/page.tsx
  /terms/page.tsx           # Términos y condiciones
  /privacy/page.tsx         # Política de privacidad

/components
  /marketing
    /hero.tsx
    /features.tsx
    /pricing-card.tsx
  /studio
    /editor/
      /code-editor.tsx      # Monaco wrapper
      /file-tabs.tsx
      /file-tree.tsx
    /chat/
      /ai-chat.tsx          # Panel de conversación
      /message.tsx
      /input.tsx
    /toolbar/
      /studio-toolbar.tsx   # Save, deploy, settings
      /resource-meter.tsx   # CPU/RAM estimado
  /dashboard
    /credits-card.tsx
    /projects-list.tsx
    /wallet-status.tsx
    /activity-feed.tsx
  /hub
    /contract-card.tsx
    /contract-grid.tsx
    /contract-detail.tsx
    /comments-section.tsx
  /bounties
    /bounty-card.tsx
    /bounty-form.tsx
    /proposal-list.tsx
  /shared
    /navbar.tsx
    /sidebar.tsx
    /footer.tsx
    /wallet-connect.tsx
    /language-switcher.tsx  # Ya existe
  /ui                       # shadcn (ya existe)

/lib
  /ai
    /client.ts              # OpenRouter/Gemini config
    /prompts.ts             # System prompts para Soroban
    /rag.ts                 # Vector search de docs
    /actions.ts             # Server actions para IA
  /stellar
    /client.ts              # SDK setup
    /wallet.ts              # Freighter integration
    /sep10.ts               # Auth challenge
    /payments.ts            # USDC transactions
    /soroban.ts             # Deploy de contratos
  /github
    /oauth.ts               # Config del provider
    /api.ts                 # Repos, commits, sync
  /db
    /queries/
      /users.ts
      /projects.ts
      /credits.ts
      /bounties.ts
      /hub.ts
  /supabase                 # Ya existe
    /client.ts
    /server.ts
    /middleware.ts

/hooks
  /use-wallet.ts            # Ya existe
  /use-credits.ts
  /use-project.ts
  /use-ai-chat.ts
  /use-editor.ts

/types
  /index.ts                 # Ya existe (User, Project, Bounty, etc.)
  /database.ts              # Types generados de Supabase
  /stellar.ts               # Types específicos de Stellar
  /ai.ts                    # Types de mensajes y respuestas IA

/constants
  /index.ts                 # Ya existe
  /routes.ts                # Rutas tipadas
  /prompts.ts               # Prompts de sistema

/stores                     # Zustand stores
  /editor-store.ts          # Estado del editor
  /chat-store.ts            # Estado del chat

/docs                       # Documentación
  /ARCHITECTURE.md          # Este archivo
```

---

## Schema de Base de Datos

### Supabase PostgreSQL

```sql
-- =============================================
-- PROFILES (extiende auth.users de Supabase)
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  github_username TEXT,
  github_avatar_url TEXT,
  stellar_address TEXT,
  credits DECIMAL(18, 7) DEFAULT 0,
  reputation INTEGER DEFAULT 0,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: Users can read all profiles, update only their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- =============================================
-- PROJECTS
-- =============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  code TEXT DEFAULT '',
  language TEXT DEFAULT 'rust' CHECK (language IN ('rust', 'typescript')),
  is_public BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  forks_count INTEGER DEFAULT 0,
  forked_from UUID REFERENCES projects(id),
  github_repo_url TEXT,
  deployed_address TEXT,  -- Soroban contract address
  deployed_network TEXT,  -- 'testnet' | 'mainnet'
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public projects are viewable by everyone"
  ON projects FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can CRUD own projects"
  ON projects FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- PROJECT LIKES (para el Hub)
-- =============================================
CREATE TABLE project_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- =============================================
-- CHAT SESSIONS (historial de IA por proyecto)
-- =============================================
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  messages JSONB DEFAULT '[]',
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: Solo el dueño del proyecto puede ver/editar
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own project chats"
  ON chat_sessions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = chat_sessions.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- =============================================
-- CREDIT TRANSACTIONS
-- =============================================
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(18, 7) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'reward', 'refund')),
  description TEXT,
  stellar_tx_hash TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON credit_transactions FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- BOUNTIES (Fase v1.0)
-- =============================================
CREATE TABLE bounties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  developer_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  budget DECIMAL(18, 2) NOT NULL,  -- en USDC
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'review', 'completed', 'disputed', 'cancelled')),
  escrow_address TEXT,
  escrow_tx_hash TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- BOUNTY PROPOSALS
-- =============================================
CREATE TABLE bounty_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id UUID REFERENCES bounties(id) ON DELETE CASCADE NOT NULL,
  developer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  proposal_text TEXT NOT NULL,
  estimated_days INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- COMMENTS (para Hub y Bounties)
-- =============================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  bounty_id UUID REFERENCES bounties(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id),
  content TEXT NOT NULL,
  line_number INTEGER,  -- Para comentarios en código específico
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (
    (project_id IS NOT NULL AND bounty_id IS NULL) OR
    (project_id IS NULL AND bounty_id IS NOT NULL)
  )
);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, github_username, github_avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'user_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update likes_count on project
CREATE OR REPLACE FUNCTION update_project_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE projects SET likes_count = likes_count + 1 WHERE id = NEW.project_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE projects SET likes_count = likes_count - 1 WHERE id = OLD.project_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_likes_count_trigger
  AFTER INSERT OR DELETE ON project_likes
  FOR EACH ROW EXECUTE FUNCTION update_project_likes_count();
```

---

## Fases de Desarrollo

### FASE 1: MVP ALFA (Meses 1-3)
**Objetivo: Studio funcional con IA básica**

#### Semana 1-2: Setup Base
- [ ] Instalar dependencias (Monaco, Stellar SDK, Vercel AI)
- [ ] Ejecutar schema SQL en Supabase
- [ ] Configurar GitHub OAuth en Supabase Dashboard
- [ ] Crear layout de plataforma (navbar, sidebar)
- [ ] Página de Dashboard básica

#### Semana 3-4: Studio Core
- [ ] Integrar Monaco Editor con syntax highlighting para Rust
- [ ] Crear componente de Chat con UI
- [ ] Conectar con OpenRouter/Gemini
- [ ] Implementar streaming de respuestas (Vercel AI SDK)
- [ ] Crear system prompts optimizados para Soroban

#### Semana 5-6: Persistencia
- [ ] CRUD completo de proyectos
- [ ] Guardar código en Supabase
- [ ] Historial de chat por proyecto
- [ ] Autosave con debounce

#### Semana 7-8: Stellar Wallet
- [ ] Integrar Freighter wallet
- [ ] Componente WalletConnect reutilizable
- [ ] Guardar stellar_address en perfil
- [ ] UI de estado de conexión

#### Semana 9-12: Polish + Testing
- [ ] Manejo de errores global
- [ ] Loading states y skeletons
- [ ] Responsive design
- [ ] Testing manual exhaustivo
- [ ] Deploy a Vercel
- [ ] Documentación de uso

---

### FASE 2: BETA (Meses 4-8)
**Objetivo: Sistema de créditos + Hub Social**

#### Sistema de Créditos
- [ ] Webhook/polling de Horizon para detectar pagos USDC
- [ ] Lógica de acreditación automática
- [ ] Deducción de créditos por tokens de IA usados
- [ ] UI de recarga con QR/dirección
- [ ] Historial de transacciones

#### RAG con Documentación Stellar
- [ ] Scraper de developers.stellar.org
- [ ] Pipeline de embeddings (OpenAI/Cohere)
- [ ] Configurar pgvector en Supabase
- [ ] Búsqueda semántica de documentación
- [ ] Inyección de contexto en prompts

#### Community Hub
- [ ] Página de exploración de contratos públicos
- [ ] Cards de proyectos con preview
- [ ] Sistema de likes funcional
- [ ] Fork de proyectos (clonar a tu cuenta)
- [ ] Comentarios en proyectos
- [ ] Perfiles públicos con stats

#### GitHub Sync
- [ ] Crear repositorios desde Sorobai
- [ ] Push automático de cambios
- [ ] Import de repos existentes
- [ ] Sync bidireccional

---

### FASE 3: v1.0 (Meses 9-12)
**Objetivo: Marketplace + Deploy a Soroban**

#### Bounty Marketplace
- [ ] CRUD de bounties
- [ ] Sistema de propuestas
- [ ] Smart contract de Escrow en Soroban
- [ ] Flujo de aceptación y pago
- [ ] Sistema de disputas básico
- [ ] Notificaciones

#### Deploy a Soroban
- [ ] Backend service para compilación Rust
- [ ] Simulación de recursos (CPU, RAM, storage)
- [ ] Deploy a Testnet con un click
- [ ] Deploy a Mainnet (requiere créditos)
- [ ] Dashboard de contratos desplegados
- [ ] Interacción con contratos desplegados

#### Auditoría IA
- [ ] Análisis automático de vulnerabilidades comunes
- [ ] Sugerencias de optimización de gas
- [ ] Badge de "AI Audited" en Hub
- [ ] Reportes de seguridad descargables

---

## Decisiones Técnicas

| Área | Decisión | Alternativas Consideradas | Razón |
|------|----------|---------------------------|-------|
| **Framework** | Next.js 15 (App Router) | Remix, Astro | Ya configurado, mejor DX, RSC |
| **Auth** | Supabase + GitHub OAuth | Auth0, Clerk | Ya configurado, integrado con DB |
| **Database** | Supabase PostgreSQL | PlanetScale, Neon | Ya configurado, RLS, pgvector |
| **AI Provider** | OpenRouter → Gemini Flash | Direct Gemini API, OpenAI | Flexibilidad de modelos, fallbacks |
| **AI Streaming** | Vercel AI SDK | Manual SSE, LangChain | Mejor DX, hooks listos |
| **Editor** | Monaco Editor | CodeMirror, Ace | Estándar industria, VS Code compatible |
| **Wallet** | Freighter | Albedo, xBull | Más popular en Stellar, mejor docs |
| **Vector DB** | Supabase pgvector | Pinecone, Weaviate | Todo en un lugar, sin vendor extra |
| **State** | Zustand + React Query | Redux, Jotai | Simple, performante, buen DX |
| **Styling** | Tailwind + shadcn/ui | Chakra, MUI | Ya configurado, customizable |
| **Deploy** | Vercel | Railway, Fly.io | Integración nativa Next.js |
| **i18n** | next-intl | next-i18next | Mejor soporte App Router |

---

## Variables de Entorno

```env
# =============================================
# SUPABASE (ya configurado)
# =============================================
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Solo backend

# =============================================
# AI - OpenRouter
# =============================================
OPENROUTER_API_KEY=sk-or-...

# =============================================
# STELLAR
# =============================================
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_PLATFORM_STELLAR_ADDRESS=G...  # Dirección para recibir pagos
PLATFORM_STELLAR_SECRET_KEY=S...  # Solo backend, para firmar

# =============================================
# GITHUB (configurar en Supabase Dashboard)
# =============================================
# No se necesitan aquí, se configuran en Supabase Auth

# =============================================
# APP
# =============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Sorobai Studio

# =============================================
# FASE 2: RAG (cuando se implemente)
# =============================================
# OPENAI_API_KEY=sk-...  # Para embeddings
# o
# COHERE_API_KEY=...
```

---

## Dependencias

### Por Instalar (Fase 1)

```bash
# Editor de código
pnpm add @monaco-editor/react

# Stellar SDK
pnpm add @stellar/stellar-sdk

# AI Streaming
pnpm add ai

# State Management
pnpm add @tanstack/react-query
pnpm add zustand

# Utilidades
pnpm add date-fns
pnpm add zod
```

### Ya Instaladas
- next
- react / react-dom
- typescript
- tailwindcss
- @supabase/ssr
- @supabase/supabase-js
- next-intl
- next-themes
- lucide-react
- shadcn/ui components (button, dropdown, etc.)

### Fase 2 (Futuro)
```bash
# Embeddings y Vector Search
pnpm add openai  # o @cohere-ai/cohere-js

# GitHub API
pnpm add @octokit/rest
```

---

## Flujo de Usuario Principal

```
┌─────────────────────────────────────────────────────────────────┐
│                         LANDING PAGE                            │
│                    (Marketing, Features)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SIGN UP / SIGN IN                          │
│                    (GitHub OAuth via Supabase)                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DASHBOARD                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Credits    │  │   Projects   │  │    Wallet    │          │
│  │   Balance    │  │    List      │  │    Status    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          STUDIO                                 │
│  ┌─────────────┐  ┌─────────────────────┐  ┌─────────────────┐ │
│  │             │  │                     │  │                 │ │
│  │   AI CHAT   │  │    MONACO EDITOR    │  │   UTILITIES     │ │
│  │             │  │                     │  │   (Simulator)   │ │
│  │  - Prompt   │  │    - Rust/Soroban   │  │                 │ │
│  │  - Explain  │  │    - Syntax HL      │  │   [DEPLOY]      │ │
│  │  - Optimize │  │    - Autocomplete   │  │   [SAVE]        │ │
│  │             │  │                     │  │   [GITHUB]      │ │
│  └─────────────┘  └─────────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │   HUB    │   │ BOUNTIES │   │  DEPLOY  │
        │ (Fase 2) │   │ (Fase 3) │   │ (Fase 3) │
        └──────────┘   └──────────┘   └──────────┘
```

---

## Contacto y Referencias

- **Documentación Stellar**: https://developers.stellar.org
- **Soroban Docs**: https://soroban.stellar.org
- **Stellar SDK**: https://github.com/stellar/js-stellar-sdk
- **Freighter Wallet**: https://freighter.app

---

*Documento creado: Diciembre 2024*
*Última actualización: Diciembre 2024*

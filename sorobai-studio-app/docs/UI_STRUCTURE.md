# UI/UX Structure - Sorobai Studio

## ✅ Completado - Fase 1 UI

### Páginas Creadas

#### 1. Landing Page `/`
- Hero section con título y CTA
- Features section (3 pilares)
- Footer
- Navbar con navegación

#### 2. Dashboard `/dashboard`
- Stats cards (Projects, Credits, Reputation)
- Lista de proyectos recientes
- Botón "New Project"
- Layout con sidebar

#### 3. Studio `/studio`
- Lista de proyectos
- Botón "New Project"
- Empty state

#### 4. Studio Editor `/studio/[projectId]`
- Layout de 2 columnas:
  - Panel izquierdo: AI Chat (400px)
  - Panel derecho: Monaco Editor
- Toolbar superior con acciones
- Chat funcional con mock messages
- Editor con código de ejemplo

#### 5. Hub `/hub`
- Grid de contratos públicos
- Search bar
- Filtros por categoría
- Cards con likes, forks, autor

#### 6. Bounties `/bounties`
- Lista de bounties
- Filtros por status
- Cards con budget, deadline, proposals
- Botón "Post Bounty"

---

## Componentes Creados

### Shared Components
- `navbar.tsx` - Navegación principal (marketing)
- `sidebar.tsx` - Sidebar de plataforma
- `user-menu.tsx` - Dropdown de usuario
- `empty-state.tsx` - Estado vacío reutilizable

### Marketing Components
- `hero.tsx` - Hero section con ilustración
- `features.tsx` - Grid de features

### Dashboard Components
- `stats-cards.tsx` - Cards de estadísticas
- `projects-list.tsx` - Lista de proyectos

### Studio Components
- `code-editor.tsx` - Monaco Editor wrapper
- `ai-chat.tsx` - Panel de chat con IA
- `studio-toolbar.tsx` - Toolbar del editor

### Hub Components
- `contract-card.tsx` - Card de contrato

### Bounties Components
- `bounty-card.tsx` - Card de bounty

---

## Mock Data

Archivo: `/lib/mock-data.ts`

Contiene:
- `mockProjects` - 3 proyectos de ejemplo
- `mockChatMessages` - Conversación de ejemplo
- `mockBounties` - 3 bounties de ejemplo
- `mockHubContracts` - 3 contratos de ejemplo
- `mockUser` - Usuario de ejemplo

---

## Estilos y Diseño

### Paleta de Colores
- **Blanco**: `#FFFFFF` - Fondo principal
- **Negro**: `#000000` - Texto, botones primarios
- **Amarillo Stellar**: `#FFD700` - Accent color
- **Grises**: Variables de shadcn/ui

### Tipografía
- **Serif** (Geist Sans) - Títulos y headers
- **Sans-serif** - Texto general
- **Monospace** (Monaco) - Código

### Componentes UI
- shadcn/ui components
- Tailwind CSS
- Dark/Light mode support

---

## Navegación

```
/ (Landing)
├── /auth/sign-in
├── /auth/sign-up
└── /dashboard (Platform)
    ├── /studio
    │   └── /studio/[projectId]
    ├── /hub
    │   └── /hub/[contractId]
    └── /bounties
        └── /bounties/[bountyId]
```

---

## Próximos Pasos

### Fase 2: Conectar Lógica
1. Configurar Supabase (ejecutar schema SQL)
2. Implementar auth real con GitHub OAuth
3. CRUD de proyectos con Supabase
4. Integrar IA real (OpenRouter + Gemini)
5. Sistema de créditos con Stellar

### Fase 3: Features Avanzadas
1. RAG con documentación de Stellar
2. GitHub sync
3. Deploy a Soroban
4. Bounties marketplace funcional

---

## Cómo Probar

1. Instalar dependencias:
```bash
cd sorobai-studio-app
pnpm install
```

2. Ejecutar dev server:
```bash
pnpm dev
```

3. Navegar a:
- Landing: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard
- Studio: http://localhost:3000/studio
- Editor: http://localhost:3000/studio/1
- Hub: http://localhost:3000/hub
- Bounties: http://localhost:3000/bounties

---

## Notas

- Todas las páginas usan mock data
- El auth no está implementado (no hay redirect)
- El editor muestra código de ejemplo
- El chat es estático (no llama a IA real)
- Los botones no tienen funcionalidad backend

Esto es intencional para poder iterar rápido en el diseño antes de conectar la lógica.

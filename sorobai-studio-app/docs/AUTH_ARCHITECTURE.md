# Authentication & Access Control Architecture

## 🎯 FILOSOFÍA: Wallet-First, GitHub-Enhanced

Sorobai Studio usa un modelo de autenticación moderno basado en Web3:
- **Wallet de Stellar = Identidad + Login + Método de Pago**
- **GitHub OAuth = Verificación + Reputación + Persistencia**

---

## 🔐 MODELO DE IDENTIDAD

### **Nivel 1: Solo Wallet (Básico)**
```
Usuario conecta Freighter
    ↓
Supabase crea sesión con wallet_address
    ↓
Acceso a funcionalidades básicas
```

**Puede hacer:**
- ✅ Ver Hub (público)
- ✅ Usar Studio (Editor + IA)
- ✅ Pagar créditos con USDC
- ✅ Ver bounties

**NO puede hacer:**
- ❌ Publicar contratos en Hub
- ❌ Aplicar a bounties
- ❌ Tener perfil público
- ❌ Ganar reputación

### **Nivel 2: Wallet + GitHub (Completo)**
```
Usuario conecta Freighter
    ↓
Usuario conecta GitHub OAuth
    ↓
Supabase vincula wallet_address + github_username
    ↓
Acceso completo a la plataforma
```

**Puede hacer:**
- ✅ TODO lo anterior +
- ✅ Publicar contratos en Hub
- ✅ Aplicar a bounties
- ✅ Perfil público verificado
- ✅ Sistema de reputación
- ✅ Sincronización con repos

---

## 🚪 CONTROL DE ACCESO POR RUTA

### **Público (Sin autenticación)**
```typescript
'/' - Landing page
'/hub' - Discovery de contratos (solo lectura)
'/hub/[contractId]' - Detalle de contrato
'/bounties' - Lista de bounties (solo lectura)
'/bounties/[bountyId]' - Detalle de bounty
'/privacy' - Privacy policy
'/terms' - Terms of service
```

### **Requiere Wallet**
```typescript
'/dashboard' - Dashboard personal
'/studio' - Lista de proyectos
'/studio/[projectId]' - Editor con IA
'/settings' - Configuración
```

### **Requiere Wallet + GitHub**
```typescript
'/profile/[username]' - Perfil público
'/hub/publish' - Publicar contrato
'/bounties/apply' - Aplicar a bounty
'/bounties/create' - Crear bounty
```

---

## 🎨 FLUJO DE ONBOARDING

### **Paso 1: Landing Page**

Usuario llega a `/`

```
┌─────────────────────────────────────┐
│ Sorobai Studio              [🌙]   │
├─────────────────────────────────────┤
│                                     │
│   Build Soroban Smart Contracts    │
│   with AI                           │
│                                     │
│   [Connect Wallet to Start]         │
│                                     │
└─────────────────────────────────────┘
```

### **Paso 2: Modal de Conexión**

Click en "Connect Wallet to Start"

```
┌─────────────────────────────────────┐
│ Welcome to Sorobai Studio       [×] │
├─────────────────────────────────────┤
│                                     │
│ Step 1: Connect Your Stellar Wallet │
│                                     │
│ [🔐 Connect Freighter]              │
│                                     │
│ Your wallet is your identity and    │
│ payment method on Sorobai Studio    │
│                                     │
└─────────────────────────────────────┘
```

### **Paso 3: GitHub Prompt (Opcional)**

Después de conectar wallet

```
┌─────────────────────────────────────┐
│ Wallet Connected! ✅            [×] │
├─────────────────────────────────────┤
│                                     │
│ Step 2: Link GitHub (Optional)      │
│                                     │
│ [🔗 Connect GitHub]                 │
│                                     │
│ Unlock full features:               │
│ • Publish contracts to Hub          │
│ • Apply to bounties                 │
│ • Build your reputation             │
│                                     │
│ [Maybe Later]                       │
│                                     │
└─────────────────────────────────────┘
```

### **Paso 4: Dashboard**

Usuario entra a la plataforma

```
┌─────────────────────────────────────┐
│ Sorobai  [GCS7...CT6W ▼] [150.5⚡] │
├─────────────────────────────────────┤
│                                     │
│ ⚠️ Link GitHub for full features   │
│    [Connect GitHub] [Dismiss]       │
│                                     │
│ Dashboard | Studio | Hub | Bounties │
│                                     │
└─────────────────────────────────────┘
```

---

## 🔒 MIDDLEWARE DE PROTECCIÓN

### **Implementación en Next.js:**

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Rutas públicas
  const publicRoutes = ['/', '/hub', '/bounties', '/privacy', '/terms'];
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Rutas que requieren wallet
  const walletRoutes = ['/dashboard', '/studio', '/settings'];
  if (walletRoutes.some(route => pathname.startsWith(route))) {
    const hasWallet = request.cookies.get('stellar_wallet_connected');
    if (!hasWallet) {
      return NextResponse.redirect(new URL('/?connect=true', request.url));
    }
  }
  
  // Rutas que requieren GitHub
  const githubRoutes = ['/profile', '/hub/publish', '/bounties/apply'];
  if (githubRoutes.some(route => pathname.startsWith(route))) {
    const hasGithub = request.cookies.get('github_connected');
    if (!hasGithub) {
      return NextResponse.redirect(new URL('/dashboard?github=required', request.url));
    }
  }
  
  return NextResponse.next();
}
```

---

## 💾 SUPABASE SCHEMA

### **Tabla: users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  github_username TEXT UNIQUE,
  github_avatar_url TEXT,
  github_id TEXT,
  ai_credits DECIMAL DEFAULT 0,
  reputation INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_wallet_address ON users(wallet_address);
CREATE INDEX idx_github_username ON users(github_username);
```

### **Tabla: sessions**
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  wallet_address TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 FLUJO TÉCNICO DE AUTENTICACIÓN

### **1. Conexión de Wallet (SEP-10)**

```typescript
// Frontend
const { publicKey } = await freighterApi.requestAccess();

// Backend API: /api/auth/wallet
POST /api/auth/wallet
Body: { publicKey, signature }

// Supabase
1. Verificar firma (SEP-10)
2. Buscar o crear usuario con wallet_address
3. Crear sesión
4. Retornar JWT token
```

### **2. Conexión de GitHub**

```typescript
// Frontend
window.location.href = '/api/auth/github';

// Backend: /api/auth/github
1. Redirect a GitHub OAuth
2. GitHub callback con code
3. Exchange code por access_token
4. Obtener perfil de GitHub
5. Actualizar usuario en Supabase
6. Redirect a /dashboard
```

---

## 🎯 INDICADORES VISUALES

### **Estado de Conexión:**

```typescript
// Solo Wallet
<Badge variant="warning">
  ⚠️ Link GitHub for full access
</Badge>

// Wallet + GitHub
<Badge variant="success">
  ✅ Fully Connected
</Badge>
```

### **Navbar:**

```typescript
// Sin conexión
[Connect Wallet to Start]

// Solo Wallet
[GCS7...CT6W ▼] [Link GitHub]

// Wallet + GitHub
[Avatar ▼] [150.5 ⚡]
```

---

## 📊 COMPARACIÓN CON OTRAS PLATAFORMAS

| Feature | Sorobai Studio | Solana dApps | Remix (Ethereum) |
|---------|----------------|--------------|------------------|
| **Login** | Freighter Wallet | Phantom/Solflare | MetaMask |
| **Identidad** | Stellar Public Key | Solana Public Key | Ethereum Address |
| **Social** | GitHub (opcional) | Twitter/Discord | ENS (opcional) |
| **Pago** | USDC on Stellar | SOL/USDC | ETH |
| **Acceso sin wallet** | Hub público | ❌ No | ✅ Sí (solo lectura) |

---

## ✅ VENTAJAS DE ESTE MODELO

### **Para el Usuario:**
1. ✅ Barrera de entrada baja (solo wallet)
2. ✅ No necesita email/password
3. ✅ Soberanía financiera (paga con su wallet)
4. ✅ Puede probar antes de comprometerse (GitHub)

### **Para la Plataforma:**
1. ✅ Uso nativo de Stellar desde el inicio
2. ✅ Calidad del Hub (solo devs con GitHub publican)
3. ✅ Menos spam y bots
4. ✅ Reputación verificable

### **Para la Ideatón:**
1. ✅ Demuestra comprensión de Web3
2. ✅ Uso claro y correcto de Stellar
3. ✅ Innovación en UX (wallet-first)
4. ✅ Modelo económico integrado

---

## 🚀 IMPLEMENTACIÓN PRIORITARIA

### **Fase 1: MVP (Esta sesión)**
- ✅ Wallet connection (HECHO)
- ⏳ Onboarding modal
- ⏳ Middleware de protección
- ⏳ Indicadores visuales

### **Fase 2: Backend**
- ⏳ Supabase auth con wallet
- ⏳ GitHub OAuth
- ⏳ Sistema de sesiones

### **Fase 3: Features Avanzadas**
- ⏳ Reputación
- ⏳ Badges
- ⏳ Auditoría social

---

## 📝 NOTAS IMPORTANTES

1. **SEP-10:** Usar el estándar de autenticación de Stellar para verificar ownership de la wallet
2. **Cookies:** Usar httpOnly cookies para el JWT, no localStorage
3. **Expiración:** Sesiones de 7 días, renovables
4. **Seguridad:** Nunca almacenar private keys, solo public keys
5. **GDPR:** Permitir que usuarios eliminen su cuenta y datos

---

## 🎯 RESULTADO ESPERADO

Un flujo de autenticación moderno, seguro y nativo de Web3 que:
- Usa Stellar como identidad principal
- Permite acceso rápido con solo wallet
- Incentiva la verificación con GitHub
- Mantiene la calidad del ecosistema
- Demuestra comprensión profunda de Stellar

**Este modelo es exactamente lo que los jueces de la Ideatón quieren ver.**

# Mapa de Rutas - Sorobai Studio

## 📍 RUTAS PÚBLICAS (sin auth)

### Marketing
- `/` - Landing page (Hero + Features)
- `/privacy` - Privacy Policy
- `/terms` - Terms of Service

### Auth
- `/auth/login` - Login page (GitHub OAuth)
- `/auth/sign-up` - Sign up page
- `/auth/forgot-password` - Forgot password
- `/auth/error` - Auth error page
- `/auth/confirm` - Email confirmation (route)
- `/auth/sign-up-success` - Success message
- `/auth/update-password` - Update password

---

## 🔒 RUTAS PROTEGIDAS (requieren auth)

Todas bajo el grupo `(platform)` con layout que incluye sidebar.

### Dashboard
- `/dashboard` - Dashboard principal (stats + projects)

### Studio
- `/studio` - Lista de proyectos
- `/studio/[projectId]` - Editor con Monaco + AI Chat
  - Ejemplo: `/studio/1`

### Hub (Community)
- `/hub` - Explorar contratos públicos
- `/hub/[contractId]` - Detalle de contrato
  - Ejemplo: `/hub/1`

### Bounties
- `/bounties` - Lista de bounties
- `/bounties/[bountyId]` - Detalle de bounty
  - Ejemplo: `/bounties/1`

---

## 🗂️ ESTRUCTURA DE ARCHIVOS

```
/app
  /page.tsx                      → / (Landing)
  /layout.tsx                    → Root layout
  
  /privacy/page.tsx              → /privacy
  /terms/page.tsx                → /terms
  
  /auth
    /login/page.tsx              → /auth/login
    /sign-up/page.tsx            → /auth/sign-up
    /forgot-password/page.tsx    → /auth/forgot-password
    /error/page.tsx              → /auth/error
    /confirm/route.ts            → /auth/confirm
    /sign-up-success/page.tsx    → /auth/sign-up-success
    /update-password/page.tsx    → /auth/update-password
  
  /(platform)                    → Grupo con sidebar
    /layout.tsx                  → Layout con sidebar + auth check
    
    /dashboard/page.tsx          → /dashboard
    
    /studio
      /page.tsx                  → /studio
      /[projectId]/page.tsx      → /studio/[id]
    
    /hub
      /page.tsx                  → /hub
      /[contractId]/page.tsx     → /hub/[id]
    
    /bounties
      /page.tsx                  → /bounties
      /[bountyId]/page.tsx       → /bounties/[id]
```

---

## 🔗 LINKS EN NAVBAR

```tsx
// Marketing Navbar (Landing)
- Logo → /
- Studio → /studio
- Hub → /hub
- Bounties → /bounties
- Docs → https://developers.stellar.org (externo)
- Login → /auth/login
- Launch App → /dashboard

// Platform Sidebar (Dashboard/Studio/Hub/Bounties)
- Dashboard → /dashboard
- Studio → /studio
- Hub → /hub
- Bounties → /bounties
- Settings → /settings (futuro)
- Sign Out → (acción)
```

---

## 🔗 LINKS EN FOOTER

```tsx
// Product
- Studio → /studio
- Hub → /hub
- Bounties → /bounties

// Resources
- Documentation → https://developers.stellar.org
- API Reference → https://developers.stellar.org
- Community → /hub

// Company
- About → /about (futuro)
- Blog → /blog (futuro)
- Careers → /careers (futuro)

// Legal
- Privacy → /privacy
- Terms → /terms

// Social
- GitHub → https://github.com
- Twitter → https://twitter.com
- LinkedIn → https://linkedin.com
```

---

## ✅ RUTAS IMPLEMENTADAS

- [x] `/` - Landing
- [x] `/privacy` - Privacy
- [x] `/terms` - Terms
- [x] `/auth/login` - Login
- [x] `/dashboard` - Dashboard
- [x] `/studio` - Studio lista
- [x] `/studio/[id]` - Studio editor
- [x] `/hub` - Hub lista
- [x] `/hub/[id]` - Hub detail
- [x] `/bounties` - Bounties lista
- [x] `/bounties/[id]` - Bounty detail

## ❌ RUTAS PENDIENTES (futuro)

- [ ] `/about` - About page
- [ ] `/blog` - Blog
- [ ] `/careers` - Careers
- [ ] `/settings` - User settings

---

## 🚨 CAMBIOS RECIENTES

- ✅ Removido sistema i18n (next-intl) - URLs ahora son limpias sin prefijo `/en`
- ✅ Eliminada carpeta `app/[locale]/` - Estructura simplificada
- ✅ Todas las rutas ahora son directas desde `/app`

---

*Última actualización: Diciembre 22, 2024*

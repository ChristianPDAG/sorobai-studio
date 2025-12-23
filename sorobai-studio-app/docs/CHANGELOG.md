# Changelog - Sorobai Studio

## [Unreleased] - 2024-12-22

### 🎉 Cambios Mayores

#### Removido Sistema de Internacionalización
- **Eliminado**: next-intl y toda la infraestructura i18n
- **Razón**: Simplificar URLs y estructura del proyecto
- **Impacto**: 
  - URLs ahora son limpias: `/dashboard` en lugar de `/en/dashboard`
  - Estructura de carpetas simplificada
  - Menos complejidad en el código

### 🗂️ Estructura de Carpetas

#### Antes (con i18n)
```
/app
  /[locale]/
    /page.tsx → /en
    /(platform)/
      /dashboard/page.tsx → /en/dashboard
```

#### Después (sin i18n)
```
/app
  /page.tsx → /
  /(platform)/
    /dashboard/page.tsx → /dashboard
```

### ✅ Rutas Actuales

**Públicas:**
- `/` - Landing page
- `/privacy` - Privacy policy
- `/terms` - Terms of service
- `/auth/login` - Login
- `/auth/sign-up` - Sign up

**Protegidas (requieren auth):**
- `/dashboard` - Dashboard principal
- `/studio` - Lista de proyectos
- `/studio/[id]` - Editor con Monaco + AI
- `/hub` - Community hub
- `/hub/[id]` - Detalle de contrato
- `/bounties` - Marketplace de bounties
- `/bounties/[id]` - Detalle de bounty

### 🧹 Limpieza Realizada

- ✅ Eliminada carpeta `app/[locale]/`
- ✅ Eliminada carpeta `app/protected/` (del template)
- ✅ Eliminada carpeta `app/studio/` (vacía, duplicada)
- ✅ Actualizada documentación (ARCHITECTURE.md, ROUTES.md)
- ✅ Sin errores de TypeScript

### 📦 Estado del Proyecto

**Implementado:**
- ✅ Next.js 15 con App Router
- ✅ Supabase (auth + DB)
- ✅ Tailwind CSS + shadcn/ui
- ✅ TypeScript
- ✅ UI completa (Landing, Dashboard, Studio, Hub, Bounties)
- ✅ Monaco Editor integrado
- ✅ Mock data para desarrollo
- ✅ Diseño responsive con colores Stellar

**Pendiente:**
- ⏳ Integración real con Supabase
- ⏳ Autenticación funcional
- ⏳ IA con streaming (Gemini/OpenRouter)
- ⏳ Stellar wallet (Freighter)
- ⏳ Sistema de créditos
- ⏳ Deploy a Soroban

### 🔄 Próximos Pasos

1. Configurar variables de entorno de Supabase
2. Implementar autenticación real
3. Conectar Monaco con persistencia
4. Integrar IA para el chat
5. Conectar Freighter wallet

---

*Última actualización: Diciembre 22, 2024*

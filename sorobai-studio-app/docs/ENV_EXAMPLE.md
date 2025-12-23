# Variables de Entorno - Sorobai Studio

Copia este contenido a `.env.local` y completa los valores.

```env
# =============================================
# SUPABASE
# Obtener de: https://supabase.com/dashboard/project/_/settings/api
# =============================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# =============================================
# AI - OpenRouter
# Obtener de: https://openrouter.ai/keys
# =============================================
OPENROUTER_API_KEY=sk-or-v1-xxxxx

# =============================================
# STELLAR
# =============================================
# Network: 'testnet' para desarrollo, 'mainnet' para producción
NEXT_PUBLIC_STELLAR_NETWORK=testnet

# Horizon URL
# Testnet: https://horizon-testnet.stellar.org
# Mainnet: https://horizon.stellar.org
NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org

# Dirección de la plataforma para recibir pagos USDC
# Generar en: https://laboratory.stellar.org/#account-creator
NEXT_PUBLIC_PLATFORM_STELLAR_ADDRESS=GXXXXX...

# Secret key de la plataforma (SOLO BACKEND - NUNCA EXPONER)
# Esta key se usa para firmar transacciones de escrow
PLATFORM_STELLAR_SECRET_KEY=SXXXXX...

# =============================================
# APP
# =============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Sorobai Studio

# =============================================
# GITHUB OAUTH
# Configurar en Supabase Dashboard:
# Authentication > Providers > GitHub
# 
# 1. Crear OAuth App en GitHub:
#    https://github.com/settings/developers
# 2. Callback URL: https://xxxxx.supabase.co/auth/v1/callback
# 3. Copiar Client ID y Client Secret a Supabase
# =============================================
# No se necesitan variables aquí, se configuran en Supabase

# =============================================
# FASE 2: RAG (cuando se implemente)
# =============================================
# Para embeddings de documentación
# OPENAI_API_KEY=sk-xxxxx
# o
# COHERE_API_KEY=xxxxx
```

## Configuración de GitHub OAuth en Supabase

1. Ve a [GitHub Developer Settings](https://github.com/settings/developers)
2. Click en "New OAuth App"
3. Completa:
   - Application name: `Sorobai Studio`
   - Homepage URL: `http://localhost:3000` (o tu dominio)
   - Authorization callback URL: `https://[TU_PROJECT_ID].supabase.co/auth/v1/callback`
4. Copia el Client ID y Client Secret
5. Ve a Supabase Dashboard > Authentication > Providers > GitHub
6. Habilita GitHub y pega las credenciales

## Crear cuenta Stellar para la plataforma

### Testnet (desarrollo)
1. Ve a [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test)
2. Click en "Generate keypair"
3. Guarda el Public Key (NEXT_PUBLIC_PLATFORM_STELLAR_ADDRESS)
4. Guarda el Secret Key (PLATFORM_STELLAR_SECRET_KEY)
5. Click en "Fund account" para obtener XLM de prueba

### Mainnet (producción)
1. Usa una wallet segura para generar las keys
2. Fondea la cuenta con XLM real
3. Establece trustline para USDC (asset code: USDC, issuer: centre.io)

## Obtener API Key de OpenRouter

1. Ve a [OpenRouter](https://openrouter.ai/)
2. Crea una cuenta
3. Ve a [API Keys](https://openrouter.ai/keys)
4. Crea una nueva key
5. Agrega créditos para usar los modelos

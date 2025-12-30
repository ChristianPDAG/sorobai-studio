<p align="center">
  <img src="https://img.shields.io/badge/Soroban-Smart_Contracts-blue?style=for-the-badge&logo=stellar" alt="Soroban"/>
  <img src="https://img.shields.io/badge/IA-Generativa-yellow?style=for-the-badge&logo=openai" alt="IA Generativa"/>
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js 16"/>
</p>

<h1 align="center">🚀 Sorobai Studio</h1>

<h3 align="center">
  <em>Transforma tus ideas en smart contracts de Soroban usando lenguaje natural</em>
</h3>

<p align="center">
  El primer IDE con inteligencia artificial diseñado exclusivamente para desarrollar en la plataforma de smart contracts de Stellar.
</p>

---

## 💡 El Problema

**Soroban es poderoso, pero la barrera de entrada es alta.**

- Requiere dominar un lenguaje de programación complejo desde cero
- La documentación está dispersa y en constante evolución
- No existen herramientas especializadas para el ecosistema
- Configurar un entorno de desarrollo toma horas antes de escribir la primera línea

**El resultado:** Miles de desarrolladores y empresas quieren construir en Soroban, pero la complejidad técnica los detiene.

---

## 🎯 Nuestra Solución

**Sorobai Studio elimina la fricción entre tu idea y un smart contract funcional.**

Un entorno de desarrollo completo que combina:
- **IA Generativa** entrenada específicamente con documentación oficial de Soroban
- **Editor profesional** con la tecnología de VS Code
- **Deploy directo** a la red Stellar con un click
- **Comunidad integrada** para compartir y reutilizar contratos

> 💬 *"Crea un token con funciones de mint, burn y transfer"*
> 
> ✨ **→ Smart contract de Soroban completo, validado y listo para deploy en segundos**

---

## 🔥 ¿Por Qué Sorobai?

### 1. IA que Entiende Soroban
Nuestro sistema **RAG (Retrieval-Augmented Generation)** consulta la documentación oficial de Soroban antes de generar código. No inventa - genera código basado en fuentes reales y actualizadas.

### 2. Validación de Seguridad Automática
Detectamos **antipatrones y vulnerabilidades** conocidas en smart contracts ANTES de que lleguen a la blockchain. Si hay errores, la IA regenera automáticamente.

### 3. De Idea a Blockchain en Minutos
Sin configurar entornos. Sin compilar manualmente. Sin dolores de cabeza. **Describe → Genera → Prueba.**

### 4. Construido 100% para Soroban
No es un IDE genérico adaptado. Cada feature está diseñada específicamente para el desarrollo de smart contracts en Stellar.

---

## ✨ Funcionalidades Principales

### 🤖 Generación de Smart Contracts con IA

| Característica | Descripción |
|----------------|-------------|
| **Lenguaje Natural** | Describe tu contrato en español o inglés |
| **RAG con Docs de Soroban** | Consulta documentación oficial en tiempo real |
| **Validación Automática** | Detecta antipatrones de seguridad |
| **Modo Code Only** | Obtén solo el código, sin explicaciones |
| **Auto-corrección** | Si detecta errores, regenera automáticamente |

### 💼 Autenticación con Wallet Stellar

- **Login sin contraseñas** - Tu wallet Freighter ES tu identidad
- **Firma criptográfica** para autenticación segura
- **Soporte Testnet y Mainnet**

### 📝 Editor Profesional

- **Monaco Editor** - La misma tecnología de VS Code
- **Syntax highlighting** optimizado para Soroban
- **Modos Replace/Append** para código generado por IA
- **Temas claro/oscuro**

### 🚀 Deploy a Stellar con Un Click

1. Prepara la transacción automáticamente
2. Firma con tu wallet Freighter
3. Envía a la red Stellar
4. **Obtén tu Contract ID** listo para interactuar

### 🌐 Hub Social de Contratos

- **Explora** smart contracts públicos de otros desarrolladores
- **Dale like** a tus favoritos
- **Forkea** proyectos a tu cuenta
- **Busca** por tags y categorías

### 💰 Marketplace de Bounties *(Próximamente)*

- Publica trabajos con presupuesto!
- Sistema de propuestas para desarrolladores
- **Escrow en Stellar** para pagos seguros

---

## 🛠️ Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Estilos** | Tailwind CSS, shadcn/ui |
| **Base de Datos** | Supabase (PostgreSQL) |
| **IA** | OpenRouter → DeepSeek, Gemini Flash |
| **RAG** | LlamaIndex + Embeddings |
| **Blockchain** | Stellar SDK, Freighter Wallet |
| **Editor** | Monaco Editor |

---

## 🎬 Demo

```
1. 🔗 Conecta tu wallet Freighter
2. 📁 Crea un nuevo proyecto
3. 💬 Describe el smart contract que necesitas
4. ✨ La IA genera el código en el editor
5. 💾 Guarda tu proyecto
6. 🚀 Deploy a Testnet con un click
7. 🔍 Verifica tu contrato en Stellar Expert
```

---

## 📊 Métricas

| Métrica | Valor |
|---------|-------|
| Validación de seguridad | Automática |
| Idiomas soportados | Español e Inglés |
| Red disponible | Testnet (Mainnet próximamente) |

---

## 🎯 Casos de Uso

| Usuario | Beneficio |
|---------|-----------|
| **Desarrolladores nuevos en blockchain** | Aprenden Soroban con asistencia de IA |
| **Startups** | Prototipan smart contracts en minutos |
| **Proyectos DeFi** | Generan tokens, escrows y contratos de pago |
| **Empresas** | Tokenizan activos sin necesidad de expertos |
| **Educadores** | Enseñan blockchain con ejemplos interactivos |

---

## 🏆 Comparativa

| Otros IDEs | Sorobai Studio |
|------------|----------------|
| Genéricos, no optimizados | **100% diseñado para Soroban** |
| IA que genera código incorrecto | **RAG con documentación oficial** |
| Sin validación de seguridad | **Detecta antipatrones automáticamente** |
| Requieren configuración compleja | **Funciona desde el navegador** |
| Sin comunidad integrada | **Hub social para compartir contratos** |

---

## � IRnstalación

### Prerrequisitos
- Node.js 18+
- Python 3.13+
- pnpm
- [Freighter Wallet](https://freighter.app)

### Pasos

```bash
# 1. Clonar repositorio
git clone https://github.com/ChristianPDAG/sorobai-studio.git
cd sorobai-studio

# 2. Instalar dependencias frontend
cd sorobai-studio-app
pnpm install

# 3. Instalar dependencias backend
cd ../server
pip install fastapi uvicorn openai python-dotenv supabase pydantic llama-index httpx

# 4. Configurar variables de entorno (ver .env.example)

# 5. Iniciar backend (Terminal 1)
cd server
uvicorn app.main:app --reload --port 8000

# 6. Iniciar frontend (Terminal 2)
cd sorobai-studio-app
pnpm run dev

# 7. Abrir http://localhost:3000
```

---

## 🔗 Links

- [Documentación de Soroban](https://soroban.stellar.org)
- [Stellar Developers](https://developers.stellar.org)
- [Freighter Wallet](https://freighter.app)

---

## 📄 Licencia

MIT License

---

<p align="center">
  <strong>Sorobai Studio</strong> — Donde las ideas se convierten en smart contracts
</p>

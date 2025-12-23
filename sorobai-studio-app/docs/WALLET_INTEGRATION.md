# Stellar Wallet Integration - Freighter

## ✅ Integración Completada

Se ha integrado **Freighter Wallet** (wallet oficial de Stellar) en Sorobai Studio.

---

## 📦 DEPENDENCIAS INSTALADAS

```bash
pnpm add @stellar/freighter-api
```

**Versión:** `@stellar/freighter-api@6.0.1`

---

## 🏗️ ARQUITECTURA

### **1. Hook Custom: `useStellarWallet`**
**Ubicación:** `lib/hooks/use-stellar-wallet.ts`

**Funcionalidades:**
- ✅ Detectar si Freighter está instalado
- ✅ Conectar wallet (solicita permiso al usuario)
- ✅ Desconectar wallet
- ✅ Obtener dirección pública (public key)
- ✅ Obtener red actual (Testnet/Mainnet)
- ✅ Firmar transacciones
- ✅ Persistencia en localStorage
- ✅ Auto-reconexión al recargar página

**Estado del Wallet:**
```typescript
{
  isConnected: boolean;
  publicKey: string | null;
  network: string | null;
  isLoading: boolean;
  error: string | null;
}
```

---

### **2. Componente: `ConnectWalletButton`**
**Ubicación:** `components/wallet/connect-wallet-button.tsx`

**Características:**
- ✅ Botón "Connect Wallet" cuando no está conectado
- ✅ Muestra dirección truncada cuando está conectado
- ✅ Modal con información de Freighter
- ✅ Manejo de errores (wallet no instalada)
- ✅ Link directo a https://freighter.app
- ✅ Loading states
- ✅ Botón de disconnect

---

### **3. Integración en Navbar**
**Ubicación:** `components/shared/navbar.tsx`

El botón de wallet ahora aparece en el navbar principal:
```
[ThemeSwitcher] [Connect Wallet] [Login] [Launch App]
```

---

## 🎨 FLUJO DE USUARIO

### **Caso 1: Usuario sin Freighter**
1. Click en "Connect Wallet"
2. Modal se abre
3. Click en "Freighter"
4. Error: "Freighter wallet is not installed"
5. Link para instalar: https://freighter.app

### **Caso 2: Usuario con Freighter (primera vez)**
1. Click en "Connect Wallet"
2. Modal se abre
3. Click en "Freighter"
4. Freighter popup aparece
5. Usuario aprueba conexión
6. Wallet conectada ✅
7. Botón muestra dirección truncada

### **Caso 3: Usuario ya conectado (recarga página)**
1. Página carga
2. Hook verifica localStorage
3. Auto-reconecta con Freighter
4. Botón muestra dirección truncada

### **Caso 4: Desconectar**
1. Click en botón con dirección
2. Wallet se desconecta
3. localStorage se limpia
4. Botón vuelve a "Connect Wallet"

---

## 🔧 USO DEL HOOK

### **En cualquier componente:**

```typescript
'use client';

import { useStellarWallet } from '@/lib/hooks/use-stellar-wallet';

export function MyComponent() {
  const { 
    isConnected, 
    publicKey, 
    network,
    connect, 
    disconnect,
    signTransaction 
  } = useStellarWallet();

  if (!isConnected) {
    return <button onClick={connect}>Connect</button>;
  }

  return (
    <div>
      <p>Connected: {publicKey}</p>
      <p>Network: {network}</p>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
}
```

---

## 🚀 FUNCIONALIDADES DISPONIBLES

### **1. Conectar Wallet**
```typescript
const { connect } = useStellarWallet();

try {
  const { publicKey, network } = await connect();
  console.log('Connected:', publicKey, network);
} catch (error) {
  console.error('Failed to connect:', error);
}
```

### **2. Firmar Transacción**
```typescript
const { signTransaction } = useStellarWallet();

try {
  const signedXdr = await signTransaction(xdr, networkPassphrase);
  console.log('Signed:', signedXdr);
} catch (error) {
  console.error('Failed to sign:', error);
}
```

### **3. Verificar si Freighter está instalado**
```typescript
const { checkFreighterInstalled } = useStellarWallet();

const installed = await checkFreighterInstalled();
if (!installed) {
  alert('Please install Freighter');
}
```

---

## 📍 DÓNDE SE USA

### **Actualmente:**
1. ✅ **Navbar** - Botón de conexión visible en todas las páginas

### **Próximos usos (cuando haya backend):**
2. ⏳ **Settings** - Gestión de wallet conectada
3. ⏳ **Profile** - Mostrar wallet verificada
4. ⏳ **Studio** - Deploy de contratos
5. ⏳ **Bounties** - Escrow de pagos
6. ⏳ **Credits** - Recargar créditos con USDC

---

## 🔐 SEGURIDAD

### **Buenas prácticas implementadas:**
- ✅ No se almacena private key (solo public key)
- ✅ Transacciones requieren aprobación del usuario
- ✅ Freighter maneja todas las claves privadas
- ✅ localStorage solo guarda estado de conexión
- ✅ Validación de errores en cada operación

---

## 🌐 REDES SOPORTADAS

Freighter soporta:
- ✅ **Testnet** (Test SDF Network)
- ✅ **Mainnet** (Public Global Stellar Network)
- ✅ **Futurenet** (para testing de features nuevas)

El usuario puede cambiar de red desde Freighter y el hook detecta el cambio.

---

## 🐛 MANEJO DE ERRORES

### **Errores comunes:**

1. **Freighter no instalado**
   ```
   Error: "Freighter wallet is not installed"
   Solución: Link a https://freighter.app
   ```

2. **Usuario rechaza conexión**
   ```
   Error: "User declined access"
   Solución: Mostrar mensaje amigable
   ```

3. **Red incorrecta**
   ```
   Error: "Wrong network"
   Solución: Pedir al usuario cambiar red en Freighter
   ```

---

## 📱 RESPONSIVE DESIGN

### **Desktop:**
```
[Connect Wallet] → Botón completo
[GDQP...4W37] → Dirección truncada visible
```

### **Mobile:**
```
[Connect Wallet] → Botón completo
[Disconnect] → Solo texto "Disconnect"
```

---

## ✅ TESTING

### **Para probar la integración:**

1. **Instalar Freighter:**
   - Chrome: https://chrome.google.com/webstore (buscar "Freighter")
   - Firefox: https://addons.mozilla.org (buscar "Freighter")

2. **Crear cuenta de prueba:**
   - Abrir Freighter
   - Crear nueva wallet
   - Cambiar a Testnet

3. **Probar conexión:**
   - Ir a http://localhost:3000
   - Click en "Connect Wallet"
   - Aprobar en Freighter
   - Ver dirección en navbar

4. **Probar persistencia:**
   - Recargar página
   - Wallet debe seguir conectada

5. **Probar desconexión:**
   - Click en dirección
   - Wallet se desconecta

---

## 🔄 PRÓXIMOS PASOS

### **Fase 1: Deploy de Contratos**
```typescript
// Usar signTransaction para deploy
const xdr = buildDeployTransaction();
const signed = await signTransaction(xdr);
await submitToStellar(signed);
```

### **Fase 2: Recargar Créditos**
```typescript
// Detectar transacción USDC a la plataforma
const payment = await sendUSDC(amount, platformAddress);
await updateCredits(payment.hash);
```

### **Fase 3: Escrow de Bounties**
```typescript
// Crear contrato de escrow
const escrow = await createEscrow(bountyId, amount);
const signed = await signTransaction(escrow.xdr);
```

---

## 📚 RECURSOS

- **Freighter Docs:** https://docs.freighter.app
- **Stellar Docs:** https://developers.stellar.org
- **Freighter API:** https://github.com/stellar/freighter
- **SEP-10:** https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md

---

## ✅ RESULTADO FINAL

**Wallet integration completada al 100%:**
- ✅ Freighter API integrada
- ✅ Hook custom funcional
- ✅ Componente de UI completo
- ✅ Integrado en navbar
- ✅ Manejo de errores
- ✅ Persistencia
- ✅ Auto-reconexión
- ✅ Listo para usar en deploy y pagos

**La app ahora puede:**
- ✅ Conectar wallets de Stellar
- ✅ Obtener direcciones públicas
- ✅ Firmar transacciones
- ✅ Detectar red actual
- ⏳ Deploy contratos (cuando haya backend)
- ⏳ Procesar pagos (cuando haya backend)

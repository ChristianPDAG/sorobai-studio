# Antipatrones en Contratos de Token Soroban (Guía de Errores Comunes)

meta-description: Lista crítica de errores, prácticas inseguras y código ineficiente que se debe EVITAR al desarrollar tokens en Soroban. Úsalo para corregir código o auditar implementaciones.
tags: antipattern, security, errors, debugging, ttl, auth, gas-optimization

Este documento describe patrones incorrectos comunes y proporciona su solución canónica ("Refactorización").

## 1. El Antipatrón "Self-Client" (Recursión Innecesaria)
**El Error:** Usar `token::Client` dentro del propio contrato para leer o modificar su propio estado.
**Por qué es malo:** Incurre en costos de gas innecesarios por la instanciación del cliente y llamadas cross-contract a sí mismo. Puede causar bucles o errores de lógica si el entorno no espera una llamada reentrante (aunque Soroban previene reentrancia, esto es conceptualmente incorrecto).

### ❌ Código Incorrecto (BAD)
```rust
fn name(e: Env) -> String {
    // ERROR: El contrato se llama a sí mismo como si fuera un usuario externo
    let client = token::Client::new(&e, &e.current_contract_address());
    client.name() 
}

fn transfer(e: Env, from: Address, to: Address, amount: i128) {
    // ERROR: Llamar a transfer sobre sí mismo
    token::Client::new(&e, &e.current_contract_address()).transfer(&from, &to, &amount);
}

```

### ✅ Solución Correcta (GOOD)

Acceder directamente al almacenamiento (`Storage`) usando las llaves de datos definidas.

```rust
fn name(e: Env) -> String {
    // Correcto: Leer directamente de la memoria de la instancia
    e.storage().instance().get(&DataKey::Name).unwrap()
}

fn transfer(e: Env, from: Address, to: Address, amount: i128) {
    // Correcto: Llamar a las funciones internas de lógica de balance
    from.require_auth();
    balance::spend_balance(&e, from, amount);
    balance::receive_balance(&e, to, amount);
    events::transfer(&e, from, to, amount);
}

```

---

## 2. El Antipatrón "Zombie Storage" (Ignorar TTL)

**El Error:** Escribir datos en `Persistent` o `Temporary` storage sin extender su tiempo de vida (`extend_ttl`).
**Por qué es malo:** En Soroban, el almacenamiento paga renta. Si no extiendes el TTL, los datos (balances de usuarios) caducarán y serán archivados (o eliminados en caso de Temporary), haciendo que el contrato falle o los usuarios pierdan acceso a sus fondos hasta que se restauren (costoso).

### ❌ Código Incorrecto (BAD)

```rust
fn mint(e: Env, to: Address, amount: i128) {
    let key = DataKey::Balance(to.clone());
    let current_balance = e.storage().persistent().get(&key).unwrap_or(0);
    // ERROR: Se guarda el dato, pero su TTL puede estar a punto de expirar
    e.storage().persistent().set(&key, &(current_balance + amount));
}

```

### ✅ Solución Correcta (GOOD)

Siempre aplicar `extend_ttl` al leer o escribir datos críticos.

```rust
const BALANCE_LIFETIME: u32 = 17280 * 30; // ~30 días
const BALANCE_THRESHOLD: u32 = 17280;      // ~1 día

fn mint(e: Env, to: Address, amount: i128) {
    let key = DataKey::Balance(to.clone());
    let current_balance = e.storage().persistent().get(&key).unwrap_or(0);
    
    e.storage().persistent().set(&key, &(current_balance + amount));
    
    // Correcto: Asegurar que el dato sobreviva por lo menos 30 días más
    e.storage().persistent().extend_ttl(&key, BALANCE_THRESHOLD, BALANCE_LIFETIME);
}

```

---

## 3. El Antipatrón "Fake Auth" (Verificación Manual)

**El Error:** Intentar verificar la identidad comparando direcciones manualmente o pasando firmas como argumentos, en lugar de usar `require_auth`.
**Por qué es malo:** Es inseguro. `require_auth` es la única forma en que el host de Soroban verifica criptográficamente que la transacción fue firmada por el dueño de la `Address`.

### ❌ Código Incorrecto (BAD)

```rust
fn transfer(e: Env, sender: Address, to: Address, amount: i128) {
    // ERROR: Esto no impide que cualquiera llame a la función pasando la dirección de otro
    if sender == to { panic!("cannot send to self"); }
    // Falta require_auth()!
    
    spend_balance(&e, sender, amount); // ROBO DE FONDOS INMINENTE
}

```

### ✅ Solución Correcta (GOOD)

```rust
fn transfer(e: Env, sender: Address, to: Address, amount: i128) {
    // Correcto: Esto detiene la ejecución si la tx no está firmada por 'sender'
    sender.require_auth(); 
    
    spend_balance(&e, sender, amount);
}

```

---

## 4. El Antipatrón "Panic por Todo"

**El Error:** Usar `panic!` para validar lógica de negocio (ej. "saldo insuficiente").
**Por qué es malo:**

1. Hace difícil el testing (el test crashea en lugar de afirmar un error).
2. Los clientes (Frontends) reciben un error genérico `HostError` en lugar de saber qué pasó.
3. No es idiomático en Rust.

### ❌ Código Incorrecto (BAD)

```rust
fn transfer(e: Env, amount: i128) {
    if amount < 0 {
        panic!("amount cannot be negative"); // Difícil de debuggear para el cliente
    }
}

```

### ✅ Solución Correcta (GOOD)

Definir un Enum de Errores y devolver `Result`.

```rust
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum TokenError {
    NegativeAmount = 1,
    InsufficientBalance = 2,
}

fn transfer(e: Env, amount: i128) -> Result<(), TokenError> {
    if amount < 0 {
        return Err(TokenError::NegativeAmount); // El cliente recibe el código de error 1
    }
    Ok(())
}

```

---

## 5. El Antipatrón "Initialización Abierta" (Front-Running)

**El Error:** No proteger la función `initialize` o no verificar si ya fue inicializado.
**Por qué es malo:** Un atacante puede observar tu despliegue y llamar a `initialize` con su propia dirección como admin antes que tú, secuestrando el contrato.

### ❌ Código Incorrecto (BAD)

```rust
pub fn initialize(e: Env, admin: Address) {
    // ERROR: Si llamo a esto por segunda vez, sobrescribo al admin
    e.storage().instance().set(&DataKey::Admin, &admin);
}

```

### ✅ Solución Correcta (GOOD)

```rust
pub fn initialize(e: Env, admin: Address) {
    // 1. Verificar si ya existe
    if e.storage().instance().has(&DataKey::Admin) {
        panic!("already initialized");
    }
    // 2. Escribir estado
    e.storage().instance().set(&DataKey::Admin, &admin);
}

```

## 6. El Antipatrón "Cálculo Pesado antes de Auth" (Gas Griefing)

**El Error:** Ejecutar lógica costosa antes de llamar a `require_auth`.
**Por qué es malo:** Aunque en Soroban las transacciones fallidas pagan tarifa, es mala práctica consumir recursos de la red si la autorización va a fallar de todos modos. Siempre falla rápido (`Fail Fast`).

### ❌ Código Incorrecto (BAD)

```rust
fn complicated_op(e: Env, user: Address) {
    // ... 50 líneas de cálculos matemáticos complejos ...
    // ... Bucles for ...
    
    user.require_auth(); // Si esto falla, desperdiciamos cómputo
}

```

### ✅ Solución Correcta (GOOD)

```rust
fn complicated_op(e: Env, user: Address) {
    user.require_auth(); // Validar primero
    
    // ... 50 líneas de cálculos matemáticos complejos ...
}

```

---

## Referencias y Documentos Relacionados

Para implementar correctamente los patrones descritos en este documento, consulta:

### Fundamentos de Contratos Token
- **[examples_token_contract](examples_token_contract.md)** - Implementación completa y correcta de un contrato de token SEP-41
- **[examples_token](examples_token.md)** - Guía paso a paso para crear tokens en Soroban

### Almacenamiento y TTL
- **[sdk_storage](sdk_storage.md)** - Documentación completa sobre tipos de almacenamiento (Instance, Persistent, Temporary) y gestión de TTL
- **[sdk_env](sdk_env.md)** - Referencia del objeto `Env` y sus métodos de storage

### Autenticación y Seguridad
- **[sdk_auth](sdk_auth.md)** - Guía detallada sobre `require_auth()`, `require_auth_for_args()` y verificación de firmas

### Manejo de Errores
- **[sdk_errors](sdk_errors.md)** - Cómo definir y usar `#[contracterror]` correctamente en lugar de `panic!`

### Tipos de Datos
- **[sdk_types](sdk_types.md)** - Tipos nativos de Soroban: Address, String, Map, Vec, y sus métodos

### Conceptos Generales
- **[overview](overview.md)** - Introducción a Soroban y arquitectura general
- **[examples_counter](examples_counter.md)** - Ejemplo básico para entender estructura de contratos

### Herramientas CLI
- **[cli_basic](cli_basic.md)** - Comandos para compilar, desplegar y probar contratos


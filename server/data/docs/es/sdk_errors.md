# Manejo de Errores en Soroban

El manejo robusto de errores es crítico en smart contracts porque las transacciones fallidas pueden resultar en pérdida de fondos o estados inconsistentes. Soroban proporciona el macro `#[contracterror]` para definir errores personalizados de forma segura.

## Definición de Errores Personalizados

Los errores en Soroban se definen como enums con el macro `#[contracterror]`.

```rust
use soroban_sdk::{contract, contractimpl, contracterror, Env, Address};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Unauthorized = 3,
    InsufficientBalance = 4,
    InvalidAmount = 5,
    NotFound = 6,
}
```

**Reglas importantes:**
- Cada error debe tener un código `u32` único
- Empieza desde `1` (el `0` está reservado)
- Usa nombres descriptivos que indiquen el problema exacto
- Deriva los traits requeridos: `Copy, Clone, Debug, Eq, PartialEq`

## Uso Básico: Result Type

Las funciones que pueden fallar deben retornar `Result<T, Error>`.

```rust
#[contract]
pub struct TokenContract;

#[contractimpl]
impl TokenContract {
    pub fn transfer(
        env: Env,
        from: Address,
        to: Address,
        amount: i128,
    ) -> Result<(), Error> {
        // Validar autorización
        from.require_auth();
        
        // Validar monto
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        
        // Obtener balance actual
        let balance = Self::get_balance(&env, &from);
        
        // Verificar fondos suficientes
        if balance < amount {
            return Err(Error::InsufficientBalance);
        }
        
        // Realizar transferencia
        Self::set_balance(&env, &from, balance - amount);
        
        let to_balance = Self::get_balance(&env, &to);
        Self::set_balance(&env, &to, to_balance + amount);
        
        Ok(())
    }
}
```

## Propagación de Errores con `?`

El operador `?` permite propagar errores automáticamente hacia arriba.

```rust
#[contractimpl]
impl TokenContract {
    pub fn withdraw(env: Env, user: Address, amount: i128) -> Result<(), Error> {
        user.require_auth();
        
        // El operador ? retorna el error si get_balance falla
        let balance = Self::get_balance_checked(&env, &user)?;
        
        if balance < amount {
            return Err(Error::InsufficientBalance);
        }
        
        Self::set_balance(&env, &user, balance - amount);
        Ok(())
    }
    
    fn get_balance_checked(env: &Env, addr: &Address) -> Result<i128, Error> {
        env.storage()
            .persistent()
            .get(addr)
            .ok_or(Error::NotFound)  // Convierte Option a Result
    }
}
```

## Conversión entre Option y Result

Es común convertir entre `Option` (devuelto por storage) y `Result`.

```rust
use soroban_sdk::symbol_short;

#[contractimpl]
impl MyContract {
    // Método 1: ok_or() - Convierte None a Error específico
    pub fn get_admin(env: Env) -> Result<Address, Error> {
        env.storage()
            .instance()
            .get(&symbol_short!("admin"))
            .ok_or(Error::NotInitialized)
    }
    
    // Método 2: ok_or_else() - Genera error lazy
    pub fn get_config(env: Env) -> Result<u32, Error> {
        env.storage()
            .instance()
            .get(&symbol_short!("config"))
            .ok_or_else(|| Error::NotInitialized)
    }
    
    // Método 3: unwrap_or() - Valor por defecto sin error
    pub fn get_counter(env: Env) -> u32 {
        env.storage()
            .persistent()
            .get(&symbol_short!("counter"))
            .unwrap_or(0)  // No retorna Error, usa valor por defecto
    }
}
```

## Pattern: Initialize Once

Patrón común para funciones de inicialización que solo deben llamarse una vez.

```rust
use soroban_sdk::symbol_short;

#[contractimpl]
impl MyContract {
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        // Verificar que no esté ya inicializado
        if env.storage().instance().has(&symbol_short!("admin")) {
            return Err(Error::AlreadyInitialized);
        }
        
        admin.require_auth();
        env.storage().instance().set(&symbol_short!("admin"), &admin);
        
        Ok(())
    }
    
    // Helper para verificar inicialización
    fn ensure_initialized(env: &Env) -> Result<(), Error> {
        if !env.storage().instance().has(&symbol_short!("admin")) {
            return Err(Error::NotInitialized);
        }
        Ok(())
    }
    
    pub fn some_operation(env: Env) -> Result<(), Error> {
        Self::ensure_initialized(&env)?;
        // ... resto de la lógica
        Ok(())
    }
}
```

## Pattern: Access Control

Validar permisos antes de operaciones sensibles.

```rust
#[contractimpl]
impl MyContract {
    fn require_admin(env: &Env, caller: &Address) -> Result<(), Error> {
        let admin: Address = env.storage()
            .instance()
            .get(&symbol_short!("admin"))
            .ok_or(Error::NotInitialized)?;
        
        if caller != &admin {
            return Err(Error::Unauthorized);
        }
        
        Ok(())
    }
    
    pub fn admin_only_action(env: Env, caller: Address, value: u32) -> Result<(), Error> {
        caller.require_auth();
        Self::require_admin(&env, &caller)?;
        
        // Solo el admin puede llegar aquí
        env.storage().instance().set(&symbol_short!("value"), &value);
        Ok(())
    }
}
```

## Pattern: Multiple Validations

Validar múltiples condiciones de forma clara.

```rust
#[contractimpl]
impl TokenContract {
    pub fn mint(
        env: Env,
        admin: Address,
        to: Address,
        amount: i128,
    ) -> Result<(), Error> {
        // 1. Validar autorización
        admin.require_auth();
        
        // 2. Validar permisos
        Self::require_admin(&env, &admin)?;
        
        // 3. Validar parámetros
        Self::validate_mint_params(&amount)?;
        
        // 4. Ejecutar operación
        let balance = Self::get_balance(&env, &to);
        Self::set_balance(&env, &to, balance + amount);
        
        Ok(())
    }
    
    fn validate_mint_params(amount: &i128) -> Result<(), Error> {
        if *amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        if *amount > 1_000_000_000 {
            return Err(Error::InvalidAmount);
        }
        Ok(())
    }
}
```

## Panic vs Result

En Soroban hay dos formas de manejar errores:

### 1. Panic (Abort Execution)

```rust
pub fn dangerous_function(env: Env, value: u32) {
    // Panic si la condición no se cumple (abort transaction)
    assert!(value > 0, "Value must be positive");
    
    // O usando unwrap (panic si es None)
    let data = env.storage()
        .instance()
        .get(&symbol_short!("data"))
        .unwrap();  // Panic si no existe
}
```

**Cuándo usar panic:**
- Errores que "nunca deberían pasar" (invariantes del código)
- Durante desarrollo/testing
- Cuando el código está en estado corrupto

### 2. Result (Graceful Error)

```rust
pub fn safe_function(env: Env, value: u32) -> Result<(), Error> {
    // Retorna error que el caller puede manejar
    if value == 0 {
        return Err(Error::InvalidAmount);
    }
    
    let data = env.storage()
        .instance()
        .get(&symbol_short!("data"))
        .ok_or(Error::NotFound)?;  // Error manejable
    
    Ok(())
}
```

**Cuándo usar Result:**
- Errores esperados (condiciones de negocio)
- Validaciones de input del usuario
- Estado del contrato que puede variar
- **Producción: Siempre preferir Result**

## Errores Comunes

### Error: Código duplicado

```rust
#[contracterror]
#[derive(Copy, Clone)]
#[repr(u32)]
pub enum Error {
    NotFound = 1,
    Invalid = 1,  // Código duplicado! Causará bugs
}
```

### Correcto: Códigos únicos

```rust
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    NotFound = 1,
    Invalid = 2,  // Código único
}
```

### Error: Usar unwrap en producción

```rust
pub fn risky_function(env: Env) -> u32 {
    // Panic si admin no existe
    let admin: Address = env.storage().instance().get(&symbol_short!("admin")).unwrap();
    0
}
```

### Correcto: Manejar error explícitamente

```rust
pub fn safe_function(env: Env) -> Result<u32, Error> {
    // Retorna error manejable
    let admin: Address = env.storage()
        .instance()
        .get(&symbol_short!("admin"))
        .ok_or(Error::NotInitialized)?;
    Ok(0)
}
```

### Error: No validar inputs

```rust
pub fn transfer(env: Env, amount: i128) {
    // No valida que amount sea positivo
    // Podría permitir transferencias negativas!
}
```

### Correcto: Validar siempre

```rust
pub fn transfer(env: Env, amount: i128) -> Result<(), Error> {
    // Valida explícitamente
    if amount <= 0 {
        return Err(Error::InvalidAmount);
    }
    Ok(())
}
```

## Testing de Errores

Cómo testear que tus errores funcionen correctamente.

```rust
#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::{Address as _, Env as _};

    #[test]
    fn test_insufficient_balance() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TokenContract);
        let client = TokenContractClient::new(&env, &contract_id);
        
        let user = Address::generate(&env);
        let recipient = Address::generate(&env);
        
        // Intentar transferir sin fondos debe fallar
        let result = client.try_transfer(&user, &recipient, &100);
        
        // Verificar que retorna el error correcto
        assert_eq!(result, Err(Ok(Error::InsufficientBalance)));
    }
    
    #[test]
    fn test_unauthorized() {
        let env = Env::default();
        let contract_id = env.register_contract(None, MyContract);
        let client = MyContractClient::new(&env, &contract_id);
        
        let admin = Address::generate(&env);
        let user = Address::generate(&env);
        
        client.initialize(&admin);
        
        // Usuario no-admin intentando acción de admin
        let result = client.try_admin_only_action(&user, &42);
        
        assert_eq!(result, Err(Ok(Error::Unauthorized)));
    }
    
    #[test]
    #[should_panic(expected = "AlreadyInitialized")]
    fn test_double_initialization() {
        let env = Env::default();
        let contract_id = env.register_contract(None, MyContract);
        let client = MyContractClient::new(&env, &contract_id);
        
        let admin = Address::generate(&env);
        
        client.initialize(&admin);
        client.initialize(&admin);  // Segunda vez debe panic
    }
}
```

## Catálogo de Errores Comunes Recomendados

Para estandarizar contratos, considera estos errores base:

```rust
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    // Inicialización (1-10)
    NotInitialized = 1,
    AlreadyInitialized = 2,
    
    // Autorización (11-20)
    Unauthorized = 11,
    PermissionDenied = 12,
    
    // Validación (21-40)
    InvalidAmount = 21,
    InvalidAddress = 22,
    InvalidParameter = 23,
    AmountTooLow = 24,
    AmountTooHigh = 25,
    
    // Estado del contrato (41-60)
    InsufficientBalance = 41,
    NotFound = 42,
    AlreadyExists = 43,
    Expired = 44,
    NotActive = 45,
    
    // Operaciones (61-80)
    TransferFailed = 61,
    MintFailed = 62,
    BurnFailed = 63,
    
    // Otros (81+)
    Unknown = 81,
}
```

## Best Practices

1. **Siempre usa `Result<T, Error>` en producción**, no panics
2. **Códigos de error únicos y secuenciales**
3. **Nombres descriptivos** que indiquen la causa exacta
4. **Valida inputs** antes de cualquier operación crítica
5. **Usa `?` operator** para propagar errores de forma limpia
6. **Testea todos los casos de error** en tus tests
7. **Documenta qué errores** puede retornar cada función pública

## Ejemplo Completo

```rust
use soroban_sdk::{contract, contractimpl, contracterror, Env, Address, symbol_short};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Unauthorized = 3,
    InsufficientBalance = 4,
    InvalidAmount = 5,
}

#[contract]
pub struct TokenContract;

#[contractimpl]
impl TokenContract {
    /// Initialize the contract with an admin
    /// Returns Error::AlreadyInitialized if called twice
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        if env.storage().instance().has(&symbol_short!("admin")) {
            return Err(Error::AlreadyInitialized);
        }
        
        admin.require_auth();
        env.storage().instance().set(&symbol_short!("admin"), &admin);
        Ok(())
    }
    
    /// Transfer tokens from one account to another
    /// Returns Error::InvalidAmount if amount <= 0
    /// Returns Error::InsufficientBalance if sender has insufficient funds
    pub fn transfer(
        env: Env,
        from: Address,
        to: Address,
        amount: i128,
    ) -> Result<(), Error> {
        from.require_auth();
        
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        
        let from_balance = Self::get_balance(&env, &from);
        if from_balance < amount {
            return Err(Error::InsufficientBalance);
        }
        
        Self::set_balance(&env, &from, from_balance - amount);
        
        let to_balance = Self::get_balance(&env, &to);
        Self::set_balance(&env, &to, to_balance + amount);
        
        Ok(())
    }
    
    // Helper functions
    fn get_balance(env: &Env, addr: &Address) -> i128 {
        env.storage().persistent().get(addr).unwrap_or(0)
    }
    
    fn set_balance(env: &Env, addr: &Address, amount: i128) {
        env.storage().persistent().set(addr, &amount);
    }
}
```

## Referencias Relacionadas

- Ver [`sdk_types.md`](/server/data/docs/es/sdk_types.md) para tipos de datos como `Result` y `Option`
- Ver [`examples_token.md`](/server/data/docs/es/examples_token.md) para uso real de errores en tokens
- Ver [`sdk_auth.md`](/server/data/docs/es/sdk_auth.md) para manejo de errores de autorización

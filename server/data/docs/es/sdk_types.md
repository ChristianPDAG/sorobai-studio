# Tipos de Datos en Soroban SDK

Los smart contracts en Soroban utilizan tipos de datos específicos del SDK que están optimizados para el entorno blockchain. Estos tipos garantizan serialización eficiente, almacenamiento óptimo y compatibilidad con la VM de Soroban.

## Tipos Primitivos

### Números Enteros

Soroban soporta enteros de diferentes tamaños, todos **sin signo** por defecto para operaciones seguras.

```rust
use soroban_sdk::{contract, contractimpl, Env};

#[contract]
pub struct Calculator;

#[contractimpl]
impl Calculator {
    pub fn add_numbers(env: Env, a: u32, b: u32) -> u32 {
        a + b
    }
    
    pub fn large_number(env: Env) -> u64 {
        1_000_000_000_u64
    }
    
    pub fn small_value(env: Env) -> i32 {
        -42 // Los enteros con signo también están disponibles
    }
}
```

**Tipos disponibles:** `u32`, `u64`, `u128`, `i32`, `i64`, `i128`

> **Importante:** No uses tipos de Rust estándar como `usize` en interfaces públicas. Siempre usa los tipos explícitos del SDK.

### Boolean

Para lógica condicional simple.

```rust
pub fn is_active(env: Env, user: Address) -> bool {
    env.storage()
        .persistent()
        .has(&user)
}
```

## Symbol

Un **Symbol** es un identificador eficiente de hasta 32 caracteres. Se usa comúnmente como clave de almacenamiento o identificador de eventos.

```rust
use soroban_sdk::{Symbol, symbol_short};

#[contractimpl]
impl MyContract {
    pub fn store_value(env: Env, value: u32) {
        let key = Symbol::new(&env, "balance");
        // O usa el macro para símbolos cortos (más eficiente)
        let key_short = symbol_short!("balance");
        
        env.storage().instance().set(&key_short, &value);
    }
}
```

**Características:**
- Máximo 32 caracteres ASCII
- Solo minúsculas, números y `_`
- Mucho más eficiente que String para claves
- Usa `symbol_short!()` para símbolos conocidos en tiempo de compilación

## String

Cadenas de texto inmutables para datos arbitrarios.

```rust
use soroban_sdk::String;

#[contractimpl]
impl MyContract {
    pub fn greet(env: Env, name: String) -> String {
        let mut greeting = String::from_str(&env, "Hello, ");
        greeting.push_str(&name);
        greeting
    }
    
    pub fn get_name(env: Env) -> String {
        String::from_str(&env, "Soroban")
    }
}
```

**Cuidado con costos:** Los Strings consumen más gas que los Symbols. Úsalos solo cuando necesites texto arbitrario o largo.

## Address

Representa una cuenta o contrato en Stellar. Es el tipo fundamental para identidad y autorización.

```rust
use soroban_sdk::Address;

#[contractimpl]
impl TokenContract {
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth(); // Verifica que 'from' autorizó esta operación
        
        // Lógica de transferencia...
    }
    
    pub fn get_admin(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&symbol_short!("admin"))
            .unwrap()
    }
}
```

**Operaciones clave:**
- `.require_auth()`: Valida autorización
- `.require_auth_for_args()`: Autorización con argumentos específicos

## Vec (Vector)

Lista dinámica de elementos del mismo tipo.

```rust
use soroban_sdk::Vec;

#[contractimpl]
impl ListContract {
    pub fn sum_numbers(env: Env, numbers: Vec<u32>) -> u32 {
        let mut total = 0u32;
        for num in numbers.iter() {
            total += num;
        }
        total
    }
    
    pub fn create_list(env: Env) -> Vec<u32> {
        let mut vec = Vec::new(&env);
        vec.push_back(10);
        vec.push_back(20);
        vec.push_back(30);
        vec
    }
    
    pub fn get_first(env: Env, items: Vec<String>) -> Option<String> {
        items.first()
    }
}
```

**Métodos comunes:**
- `.push_back()`, `.push_front()`
- `.pop_back()`, `.pop_front()`
- `.get(index)` → `Option<T>`
- `.len()`
- `.iter()`

## Map (Diccionario)

Estructura clave-valor para almacenar pares de datos.

```rust
use soroban_sdk::Map;

#[contractimpl]
impl RegistryContract {
    pub fn register_users(env: Env) -> Map<Address, u32> {
        let mut registry = Map::new(&env);
        
        let alice = Address::from_string(&String::from_str(&env, "GABC..."));
        let bob = Address::from_string(&String::from_str(&env, "GDEF..."));
        
        registry.set(alice, 100);
        registry.set(bob, 250);
        
        registry
    }
    
    pub fn get_balance(env: Env, user: Address) -> u32 {
        let balances: Map<Address, u32> = env.storage()
            .persistent()
            .get(&symbol_short!("balances"))
            .unwrap_or(Map::new(&env));
            
        balances.get(user).unwrap_or(0)
    }
}
```

**Métodos comunes:**
- `.set(key, value)`
- `.get(key)` → `Option<Value>`
- `.has(key)` → `bool`
- `.remove(key)`
- `.keys()` → `Vec<Key>`
- `.values()` → `Vec<Value>`

## Bytes y BytesN

Para datos binarios arbitrarios.

```rust
use soroban_sdk::{Bytes, BytesN};

#[contractimpl]
impl DataContract {
    // BytesN: Tamaño fijo conocido en compile time
    pub fn store_hash(env: Env, hash: BytesN<32>) {
        env.storage().persistent().set(&symbol_short!("hash"), &hash);
    }
    
    // Bytes: Tamaño variable
    pub fn store_data(env: Env, data: Bytes) {
        env.storage().persistent().set(&symbol_short!("data"), &data);
    }
}
```

**Cuándo usar cada uno:**
- `BytesN<N>`: Para hashes, claves criptográficas (tamaño fijo)
- `Bytes`: Para datos binarios de longitud variable

## Option y Result

Para manejo de valores opcionales y errores.

```rust
use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotFound = 1,
    Unauthorized = 2,
}

#[contractimpl]
impl MyContract {
    // Option: Valor que puede no existir
    pub fn find_user(env: Env, id: u32) -> Option<Address> {
        env.storage().persistent().get(&id)
    }
    
    // Result: Operación que puede fallar
    pub fn withdraw(env: Env, user: Address, amount: u32) -> Result<(), Error> {
        user.require_auth();
        
        let balance: u32 = env.storage()
            .persistent()
            .get(&user)
            .ok_or(Error::NotFound)?;
        
        if balance < amount {
            return Err(Error::Unauthorized);
        }
        
        env.storage().persistent().set(&user, &(balance - amount));
        Ok(())
    }
}
```

## Estructuras Personalizadas (Custom Types)

Puedes definir tus propios tipos de datos con `#[contracttype]`.

```rust
use soroban_sdk::contracttype;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct User {
    pub address: Address,
    pub balance: u64,
    pub active: bool,
}

#[contracttype]
pub enum Status {
    Pending,
    Approved,
    Rejected,
}

#[contractimpl]
impl MyContract {
    pub fn create_user(env: Env, addr: Address) -> User {
        User {
            address: addr,
            balance: 0,
            active: true,
        }
    }
    
    pub fn store_user(env: Env, user: User) {
        env.storage().persistent().set(&user.address, &user);
    }
    
    pub fn get_status(env: Env) -> Status {
        Status::Pending
    }
}
```

**Requisitos:**
- Todos los campos deben ser tipos válidos de Soroban
- Deriva `Clone` para permitir copias
- Usa `#[contracttype]` obligatoriamente

## Tabla de Comparación Rápida

| Tipo | Caso de Uso | Costo Gas | Tamaño Max |
|------|-------------|-----------|------------|
| `u32`, `i32` | Números pequeños | Bajo | 32 bits |
| `u64`, `i64` | Números medianos | Bajo | 64 bits |
| `u128`, `i128` | Cantidades grandes (tokens) | Medio | 128 bits |
| `Symbol` | Claves, identificadores | Muy Bajo | 32 chars |
| `String` | Texto arbitrario | Alto | Variable |
| `Address` | Cuentas/contratos | Bajo | 32 bytes |
| `Vec<T>` | Listas dinámicas | Medio-Alto | Variable |
| `Map<K,V>` | Diccionarios | Medio-Alto | Variable |
| `BytesN<N>` | Datos binarios fijos | Bajo | N bytes |
| `Bytes` | Datos binarios variables | Medio | Variable |

## Errores Comunes

### Error: Usar tipos de Rust estándar

```rust
// MAL: No compila
pub fn bad_function(env: Env, text: std::string::String) -> usize {
    text.len()
}
```

### Correcto: Usar tipos del SDK

```rust
// BIEN: Usa tipos de Soroban
pub fn good_function(env: Env, text: String) -> u32 {
    text.len()
}
```

### Error: Symbol demasiado largo

```rust
// MAL: Panic en runtime
let key = Symbol::new(&env, "this_is_a_very_long_key_name_that_exceeds_limit");
```

### Correcto: Symbol corto

```rust
// BIEN: Máximo 32 caracteres
let key = symbol_short!("balance");
```

## Best Practices

1. **Usa `Symbol` en lugar de `String` para claves** de almacenamiento
2. **Prefiere `u64`/`u128` para cantidades** de tokens y balances
3. **Usa `contracttype` para datos complejos** que se repitan
4. **Minimiza el uso de `Vec` y `Map`** en storage (alto costo)
5. **Siempre usa `Address.require_auth()`** antes de operaciones sensibles

## Referencias Relacionadas

- Ver [`sdk_storage.md`](/server/data/docs/es/sdk_storage.md) para cómo almacenar estos tipos
- Ver [`sdk_errors.md`](/server/data/docs/es/sdk_errors.md) para manejo de errores con `Result`
- Ver [`examples_token.md`](/server/data/docs/es/examples_token.md) para uso de `i128` en tokens

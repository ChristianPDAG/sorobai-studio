# Ejemplo de Token en Soroban

En Soroban, los tokens se implementan como **smart contracts** que siguen una interfaz estandarizada definida en el Soroban SDK. Esto permite que wallets, aplicaciones y otros contratos interactúen con los tokens de manera predecible, similar a los estándares ERC-20.

Existen dos tipos comunes de tokens en Stellar:

* **Stellar Asset Contract (SAC):** Contratos integrados (*built-in*) que representan activos nativos de Stellar (XLM y activos emitidos).
* **Custom Tokens:** **Smart contracts** definidos por el usuario que implementan la interfaz de token.

Este ejemplo se enfoca en los patrones típicos para la implementación de un **Custom Token**.

## Conceptos Principales (Core Token Concepts)

Un contrato de token en Soroban usualmente provee:

* Seguimiento de **balances** para las cuentas.
* Transferencia de tokens entre cuentas (**Transfers**).
* Funciones opcionales de **minting** (acuñación) y **burning** (quema).
* Emisión de **Events** para indexación y observabilidad.

## Patrón de Autorización (Authorization Pattern)

Las transferencias de tokens deben ser autorizadas por la cuenta propietaria de los fondos. Soroban utiliza `require_auth` para hacer cumplir esta regla eficientemente.

```rust
// La dirección 'from' debe firmar la transacción
from.require_auth();

```

Esto asegura que el llamador (*caller*) ha autorizado explícitamente la acción, previniendo gastos no autorizados.

## Patrón de Almacenamiento (Storage Pattern)

Los contratos de token guardan balances y metadatos utilizando el **Storage** del contrato.

Los patrones comunes incluyen:

* **Instance Storage:** Usado para el estado global (dirección del **admin**, metadatos del token como nombre/símbolo).
* **Persistent Storage:** Usado para los **balances** de los usuarios.
* **TTL Extension:** Los contratos a menudo extienden el tiempo de vida (**TTL**) del almacenamiento en las lecturas y escrituras para mantener los datos vivos en la **ledger**.

## Ejemplo de Transferencia (Transfer Example)

Una implementación simplificada de transferencia sigue estos pasos:

1. Verificar autorización (`require_auth`).
2. Actualizar balances (usando funciones internas auxiliares).
3. Publicar un evento de transferencia (**Transfer event**).

```rust
pub fn transfer(e: Env, from: Address, to: Address, amount: i128) {
    // 1. Authorization
    from.require_auth();

    // 2. Logic (Simplified)
    spend_balance(&e, from.clone(), amount);
    receive_balance(&e, to.clone(), amount);

    // 3. Event
    events::Transfer { from, to, amount }.publish(&e);
}

```

## Eventos (Events)

Los contratos de token en Soroban emiten eventos estándar para permitir que sistemas externos rastreen la actividad.

Los eventos comunes incluyen:

* `Transfer`
* `Mint`
* `Burn`
* `Approve`

## Patrón de Inicialización (Initialization Pattern)

Los contratos típicamente se inicializan después del despliegue (*deployment*) usando un constructor o una función `initialize`. Esto configura el **admin** y los metadatos.

```rust
pub fn initialize(e: Env, admin: Address, decimals: u32, name: String, symbol: String) {
    write_admin(&e, admin);
    write_metadata(&e, decimals, name, symbol);
}

```

## TokenClient

El SDK genera automáticamente una estructura `TokenClient` basada en la interfaz. Esto permite a los desarrolladores interactuar con contratos de token desde otros contratos o dentro de los **tests**.

```rust
// Ejemplo de uso en un test o llamada cross-contract
let client = TokenClient::new(&env, &contract_id);

// Llama de forma transparente a las funciones definidas en la interfaz
client.transfer(&from, &to, &100);

```

Este cliente funciona de manera transparente tanto con **Stellar Asset Contracts** como con **Custom Tokens**.

## Estructura Completa Recomendada

```rust
#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror,
    Address, Env, String, Symbol, symbol_short
};

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
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        // Inicialización
    }
    
    pub fn mint(env: Env, to: Address, amount: i128) -> Result<(), Error> {
        // Acuñar tokens
    }
    
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) -> Result<(), Error> {
        // Transferir tokens
    }
    
    pub fn balance(env: Env, id: Address) -> i128 {
        // Consultar balance
    }
}
```

## Best Practices para Tokens

1. **Usa `i128` para balances**: Soporta valores grandes y negativos para cálculos
2. **Valida `amount > 0`**: Previene transferencias inválidas
3. **Extiende TTL en lecturas**: Mantén los balances activos
4. **Emite eventos**: Facilita indexación y tracking
5. **Implementa `initialize` once**: Previene re-inicialización

## Referencias Relacionadas

- **[SDK Types](sdk_types.md)**: Uso de `i128` para balances, `Address`, `String`
- **[SDK Storage](sdk_storage.md)**: Persistent Storage para balances, Instance para metadata
- **[SDK Auth](sdk_auth.md)**: `require_auth()` en transferencias y mint
- **[SDK Errors](sdk_errors.md)**: Definición y manejo de errores del token
- **[SDK Env](sdk_env.md)**: Emisión de eventos y acceso al storage
- **[Example Counter](examples_counter.md)**: Ejemplo más simple para entender fundamentos
- **[CLI Basics](cli_basic.md)**: Deploy e invoke del contrato de token
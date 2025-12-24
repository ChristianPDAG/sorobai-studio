# Autorización (Auth) en Soroban SDK

## Descripción General

El módulo `src/auth.rs` define los tipos fundamentales y las estructuras de datos utilizadas por el **Soroban Authorization Framework**. A diferencia de `env.rs`, que contiene la *lógica* de ejecución, `auth.rs` contiene las *definiciones* que describen **qué** se está autorizando.

Este módulo es crucial para entender cómo los contratos verifican la identidad de los llamadores (invokers) y cómo se autorizan llamadas a sub-contratos (cross-contract calls) en nombre del contrato actual.

## Tipos Principales

### 1. `Context` (Enum)

El enum `Context` describe el contexto específico en el que se requiere una autorización. Identifica qué acción está intentando realizar el firmante.

* **`Contract(ContractContext)`**: Indica que la autorización es para la invocación de una función de un contrato inteligente. Este es el caso más común (ej. un usuario llamando a `transfer` en un contrato de token).
* **`CreateContractHostFn(CreateContractHostFnContext)`**: Indica autorización para la creación de un nuevo contrato mediante la función del host (sin constructor).
* **`CreateContractWithCtorHostFn(...)`**: Indica autorización para crear un contrato que incluye argumentos de constructor.

### 2. `ContractContext` (Struct)

Esta estructura detalla los parámetros específicos de una invocación de contrato que requiere autorización. Es el "payload" que el usuario firma implícita o explícitamente.

* **`contract`**: La dirección (`Address`) del contrato que se está invocando.
* **`fn_name`**: El nombre de la función (`Symbol`) que se va a ejecutar.
* **`args`**: La lista de argumentos (`Vec<Val>`) pasados a la función.

Esta estructura asegura que la autorización esté vinculada a una ejecución específica y no pueda ser reutilizada para llamar a otras funciones o contratos (prevención de replay y confusión de destino).

### 3. `InvokerContractAuthEntry`

Esta estructura se utiliza cuando un contrato actúa como intermediario y necesita autorizar llamadas a sub-contratos en su propio nombre o en nombre del usuario (si se utiliza `authorize_as_current_contract`).

Representa una entrada en el árbol de autorización que el contrato actual presenta al Host para justificar las llamadas posteriores que realizará.

## Flujo de Autorización en el SDK

Aunque los tipos se definen en `auth.rs`, su uso principal ocurre a través de los métodos del `Env` y el tipo `Address`:

1. **Verificación (`require_auth`)**:
Cuando se llama a `address.require_auth()`, el Host construye un `Context::Contract` con los datos de la llamada actual y verifica si esa dirección ha firmado ese contexto específico.
2. **Autorización de Sub-llamadas**:
El método `env.authorize_as_current_contract(auth_entries)` utiliza `InvokerContractAuthEntry` para permitir que el contrato actual realice llamadas a otros contratos que requieren autorización, insertando estas entradas en el árbol de invocación autorizado.

## Relación con Testutils

En el entorno de pruebas (`testutils`), estos tipos son fundamentales para simular autorizaciones mediante `MockAuth`. Al crear un `MockAuth`, se construyen instancias de `ContractContext` para definir qué llamadas específicas se deben simular como "aprobadas" sin necesidad de firmas criptográficas reales.

## Macros Relacionadas

Estos tipos suelen estar decorados con `#[contracttype]`, lo que permite que sean serializados y deserializados eficientemente para interactuar con el Host de Soroban y ser representados en XDR (la capa de codificación de datos de Stellar).

## Patrones Comunes de Autorización

### Patrón 1: Autorización Simple
```rust
pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
    from.require_auth();  // El 'from' debe autorizar
    // ... lógica de transferencia
}
```

### Patrón 2: Validación de Admin
```rust
pub fn admin_action(env: Env, admin: Address) -> Result<(), Error> {
    admin.require_auth();
    
    let stored_admin: Address = env.storage()
        .instance()
        .get(&symbol_short!("admin"))
        .ok_or(Error::NotInitialized)?;
    
    if admin != stored_admin {
        return Err(Error::Unauthorized);
    }
    
    Ok(())
}
```

### Patrón 3: Autorización con Argumentos Específicos
```rust
pub fn approve(env: Env, from: Address, spender: Address, amount: i128) {
    // Autoriza específicamente estos argumentos
    from.require_auth_for_args((spender.clone(), amount).into_val(&env));
}
```

## Referencias Relacionadas

- **[SDK Errors](sdk_errors.md)**: Manejo de errores de autorización (Error::Unauthorized)
- **[SDK Types](sdk_types.md)**: Tipo `Address` y sus métodos
- **[SDK Env](sdk_env.md)**: Contexto de ejecución para autorización
- **[Example Token](examples_token.md)**: Uso real de `require_auth()` en transferencias
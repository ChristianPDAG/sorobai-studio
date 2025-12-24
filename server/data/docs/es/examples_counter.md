# Ejemplo de Contador en Soroban (Counter)

Este ejemplo demuestra un contrato inteligente básico en Soroban que almacena un número entero y lo incrementa cada vez que es invocado. Es el ejemplo fundamental para entender cómo funciona el **State Management** (gestión de estado) en Soroban.

## Conceptos Principales

* **Instance Storage:** Se utiliza para guardar el valor del contador. Como es un dato único y global para este contrato, el almacenamiento de instancia es el más adecuado y eficiente.
* **Symbol:** Se usa una clave estática (un `Symbol`) para identificar el valor en el almacenamiento.
* **Mutación de Estado:** Lectura, modificación y escritura de datos en el `Env`.

## Código del Contrato

El contrato define una constante para la clave de almacenamiento y una función pública `increment`.

```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol};

// Definimos la clave de almacenamiento como un Symbol corto y eficiente
const COUNTER: Symbol = symbol_short!("COUNTER");

#[contract]
pub struct IncrementContract;

#[contractimpl]
impl IncrementContract {
    /// Incrementa el contador interno y devuelve el nuevo valor.
    pub fn increment(env: Env) -> u32 {
        // 1. Obtener el almacenamiento de la instancia
        let storage = env.storage().instance();

        // 2. Leer el valor actual. Si no existe, usamos 0 por defecto.
        // `get` devuelve un Option, así que usamos unwrap_or(0).
        let mut count: u32 = storage.get(&COUNTER).unwrap_or(0);

        // 3. Modificar el valor (lógica de negocio)
        count += 1;

        // 4. Guardar el nuevo valor en el almacenamiento
        storage.set(&COUNTER, &count);

        // 5. Extender el TTL (Time To Live) de la instancia
        // Esto asegura que el contrato no expire pronto.
        storage.extend_ttl(100, 100);

        // 6. Devolver el resultado
        count
    }
}

```

### Explicación de Pasos

1. **`env.storage().instance()`**: Accede al espacio de almacenamiento de la instancia del contrato.
2. **`get(&COUNTER)`**: Recupera el valor asociado a la clave. Devuelve un `Option<u32>`.
3. **`set(&COUNTER, &count)`**: Persiste el nuevo valor en la **Ledger**.
4. **`extend_ttl`**: Mantenimiento de **rent**; extiende la vida útil del almacenamiento para evitar que sea archivado.

## Pruebas (Testing)

Soroban permite probar el contrato localmente usando un **Host** simulado.

```rust
#[test]
fn test() {
    // 1. Crear un entorno de prueba (Test Environment)
    let env = Env::default();
    
    // 2. Registrar el contrato en el entorno
    let contract_id = env.register_contract(None, IncrementContract);
    
    // 3. Crear un cliente para invocar el contrato
    let client = IncrementContractClient::new(&env, &contract_id);

    // 4. Invocar la función y verificar resultados
    assert_eq!(client.increment(), 1);
    assert_eq!(client.increment(), 2);
    assert_eq!(client.increment(), 3);
}

```

El `Client` generado automáticamente (`IncrementContractClient`) permite llamar a las funciones del contrato como si fueran métodos nativos de Rust, facilitando enormemente la escritura de tests.

## Casos de Uso Reales

Este patrón de contador es útil para:

- **Contadores de ID únicos**: Generar IDs secuenciales para NFTs o registros
- **Estadísticas del contrato**: Número de operaciones realizadas
- **Rate limiting**: Contador de uso para límites de llamadas
- **Versionado**: Tracking de versión del estado del contrato

## Variaciones Comunes

### Contador con Incremento Personalizado
```rust
pub fn increment_by(env: Env, value: u32) -> u32 {
    let storage = env.storage().instance();
    let mut count: u32 = storage.get(&COUNTER).unwrap_or(0);
    count += value;
    storage.set(&COUNTER, &count);
    storage.extend_ttl(100, 100);
    count
}
```

### Contador con Decremento
```rust
pub fn decrement(env: Env) -> Result<u32, Error> {
    let storage = env.storage().instance();
    let mut count: u32 = storage.get(&COUNTER).unwrap_or(0);
    
    if count == 0 {
        return Err(Error::InvalidAmount);
    }
    
    count -= 1;
    storage.set(&COUNTER, &count);
    storage.extend_ttl(100, 100);
    Ok(count)
}
```

## Referencias Relacionadas

- **[SDK Storage](sdk_storage.md)**: Instance Storage y métodos `.get()`, `.set()`
- **[SDK Types](sdk_types.md)**: Tipos como `u32` y `Symbol`
- **[SDK Env](sdk_env.md)**: Uso del entorno `Env`
- **[SDK Errors](sdk_errors.md)**: Manejo de errores con `Result`
- **[CLI Basics](cli_basic.md)**: Cómo desplegar y probar este contrato
- **[Example Token](examples_token.md)**: Ejemplo más complejo con múltiples funciones
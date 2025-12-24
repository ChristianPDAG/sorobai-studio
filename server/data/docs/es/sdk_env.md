# Entorno de Ejecución (Env) en Soroban SDK

## Descripción General

El tipo `Env` es la estructura central del Soroban SDK. Proporciona acceso al entorno en el que se está ejecutando el contrato inteligente. Actúa como el puente entre el código del contrato (Guest) y el Host de Soroban (la blockchain o el entorno de pruebas local).

La mayoría de los tipos y operaciones en Soroban requieren acceso a una instancia de `Env` para ser construidos, convertidos o ejecutados.

## Arquitectura y Comportamiento

### Modelo Guest vs. Host

El comportamiento de `Env` cambia dependiendo del objetivo de compilación (`target_family`):

1. **WASM (`target_family = "wasm"`):** `Env` es un envoltorio ligero (`Guest`) que realiza llamadas directas a las funciones exportadas por el host de WASM. En este modo, el manejo de errores es mínimo ya que los fallos suelen resultar en un "trap" (detención) de la VM.
2. **Nativo/Test (`not(target_family = "wasm")`):** `Env` envuelve una instancia completa del `Host`. Esto permite la simulación del entorno, depuración avanzada, backtraces y pruebas unitarias en máquinas locales sin necesidad de desplegar en la red.

### Clonación

La estructura `Env` está diseñada para ser clonada de manera eficiente (`#[derive(Clone)]`). No copia el estado completo de la ledger, sino solo las referencias o identificadores necesarios para interactuar con el entorno.

## Funcionalidades Principales

El `Env` expone métodos para acceder a subsistemas críticos del contrato:

### 1. Almacenamiento y Persistencia

* **`storage(&self) -> Storage`**: Devuelve una instancia para acceder y actualizar los datos persistentes propiedad del contrato actual (Instance, Temporary, Persistent).

### 2. Contexto de la Ledger

* **`ledger(&self) -> Ledger`**: Proporciona acceso a información del ledger actual, como el número de secuencia, marcas de tiempo (timestamp) y configuración de la red.
* **`current_contract_address(&self) -> Address`**: Devuelve el objeto `Address` correspondiente al contrato que se está ejecutando actualmente.

### 3. Emisión de Eventos y Logs

* **`events(&self) -> Events`**: Permite publicar eventos asociados al contrato actual, los cuales son visibles externamente.
* **`logs(&self) -> Logs`**: Proporciona acceso al sistema de registro para depuración (debug events).

### 4. Criptografía y Aleatoriedad

* **`crypto(&self) -> Crypto`**: Acceso a funciones criptográficas estándar (hashing, verificación de firmas).
* **`prng(&self) -> Prng`**: Acceso al generador de números pseudo-aleatorios. **Nota:** No debe usarse para generación de claves privadas u operaciones sensibles de seguridad crítica fuera del contexto del contrato.

### 5. Invocación de Contratos (Cross-Contract Calls)

El `Env` permite llamar a funciones de otros contratos desplegados:

* **`invoke_contract<T>(...) -> T`**: Invoca una función de otro contrato. Si la llamada falla o el tipo de retorno no coincide, provoca un pánico (trap).
* **`try_invoke_contract<T, E>(...) -> Result<...>`**: Similar a la anterior, pero captura errores de ejecución, permitiendo al contrato manejar fallos en sub-llamadas de manera controlada.

## Métodos Esenciales del Env

### Acceso al Almacenamiento
```rust
let storage = env.storage().instance();
let balance: u32 = storage.get(&symbol_short!("balance")).unwrap_or(0);
```

### Obtener Contexto del Contrato
```rust
let current_address = env.current_contract_address();
let ledger_timestamp = env.ledger().timestamp();
```

### Emisión de Eventos
```rust
env.events().publish((symbol_short!("transfer"),), (from, to, amount));
```

## Referencias Relacionadas

- **[SDK Storage](sdk_storage.md)**: Uso detallado de `env.storage()`
- **[SDK Auth](sdk_auth.md)**: Autorización usando `Address` del Env
- **[SDK Types](sdk_types.md)**: Tipos que se construyen con `&env`
- **[SDK Errors](sdk_errors.md)**: Manejo de errores con `Result` y panic
- **[Example Counter](examples_counter.md)**: Uso básico del `Env`
- **[Example Token](examples_token.md)**: Uso avanzado de eventos y storage

### 6. Autorización (Auth)

* **`require_auth(&self, address: &Address)`**: Verifica que la dirección proporcionada haya autorizado la llamada actual.
* **`authorize_as_current_contract(&self, ...)`**: Autoriza llamadas profundas (sub-contratos) en nombre del contrato actual.

## Utilidades de Pruebas (Testutils)

Cuando se compila con la feature `testutils` o en configuración de `test`, `Env` adquiere capacidades extendidas para simulación y pruebas unitarias.

### Configuración y Creación

* **`Env::default()`**: En tests, crea un entorno nuevo con configuración por defecto (incluyendo snapshots al finalizar).
* **`new_with_config(EnvTestConfig)`**: Permite personalizar el comportamiento del entorno de pruebas.

### Registro de Contratos (Mocking)

* **`register(contract, args)`**: Registra un contrato definido en el crate actual (struct Rust) dentro del entorno de pruebas.
* **`register_at(contract_id, contract, args)`**: Registra un contrato en una dirección específica.
* **`mock_auths(&self, auths: &[MockAuth])`**: Permite simular autorizaciones para pruebas, evitando la necesidad de firmas criptográficas reales.
* **`mock_all_auths(&self)`**: Hace que todas las llamadas a `require_auth` tengan éxito automáticamente. Útil para probar la lógica de negocio sin configurar árboles de autorización complejos.

### Snapshots (Instantáneas)

El `Env` permite guardar y cargar el estado completo del entorno (ledger, eventos, almacenamiento) para pruebas de regresión:

* **`to_snapshot_file(path)`**: Escribe el estado actual a un archivo JSON.
* **`from_snapshot_file(path)`**: Restaura un `Env` desde un archivo.
* **`cost_estimate(&self)`**: Devuelve una estimación de los recursos (CPU, Memoria) consumidos durante la ejecución, útil para optimización de gas.

## Manejo de Errores Internos

El módulo define internamente cómo se manejan los errores irrecuperables:

* En **WASM**, un error resulta en un estado inalcanzable (`unreachable`), deteniendo la ejecución.
* En **Test/Host**, se utiliza `escalate_error_to_panic` para simular el comportamiento de "crash" de la VM, pero permitiendo capturar el error en el test runner para su inspección.

## Traits Relacionados

`Env` implementa y utiliza traits auxiliares para la conversión de tipos entre el Host y el Guest:

* **`IntoVal<E, T>`**: Convierte un tipo de Rust a un valor de Soroban (`Val`).
* **`FromVal<E, T>`**: Convierte un valor de Soroban (`Val`) a un tipo de Rust.
# Almacenamiento (Storage) en Soroban SDK

## Descripción General

El módulo `src/storage.rs` define la interfaz para el almacenamiento y recuperación de datos dentro de un contrato inteligente en ejecución. Este sistema es fundamental para la gestión del estado (state) del contrato.

### Principio de Aislamiento

El almacenamiento es privado para cada contrato. Un contrato solo puede consultar y modificar sus propios datos; no existe acceso directo al almacenamiento de otros contratos.

## Tipos de Almacenamiento (Storage Types)

Soroban ofrece tres categorías de almacenamiento, cada una optimizada para diferentes casos de uso, costos y ciclos de vida:

### 1. Temporary (Temporal)

* **Características:** Es la opción más económica.
* **Ciclo de Vida:** Cuando una entrada expira, se elimina permanentemente y no puede recuperarse (no entra en el *Expired State Stack*).
* **Caso de Uso:** Datos que solo son relevantes por periodos cortos o que pueden ser recreados arbitrariamente (ej. datos de oráculos, ofertas en un DEX, autorizaciones temporales).

### 2. Persistent (Persistente)

* **Características:** Más costoso que el temporal.
* **Ciclo de Vida:** Si una entrada expira, se elimina del estado activo pero se envía al *Expired State Stack* (ESS). Puede ser recuperada (restaurada) mediante una operación de Stellar Core.
* **Caso de Uso:** Datos críticos que deben perdurar indefinidamente, como balances de tokens o propiedades de usuarios.

### 3. Instance (Instancia)

* **Características:** Almacenamiento vinculado directamente a la entrada de la instancia del contrato.
* **Comportamiento:** Se carga desde la ledger **cada vez** que se carga el contrato, independientemente de si se usa o no. No cuenta adicionalmente en el *footprint* de lectura.
* **Límite:** El espacio es limitado por el tamaño máximo de una entrada de ledger (aprox. 100 KB serializados).
* **Caso de Uso:** Datos globales pequeños y frecuentemente accedidos, como el administrador del contrato, configuración (flags), o metadatos del token.

## Estructura `Storage` y API

La estructura `Storage` actúa como el punto de entrada principal (`env.storage()`) y expone métodos para acceder a los subsistemas específicos:

* **`persistent() -> Persistent`**
* **`temporary() -> Temporary`**
* **`instance() -> Instance`**
* **`max_ttl() -> u32`**: Devuelve el TTL (Time To Live) máximo posible para una entrada en la red actual.

### Operaciones CRUD Comunes

Las estructuras `Persistent`, `Temporary` e `Instance` comparten una API genérica consistente:

* **`set<K, V>(&self, key: &K, val: &V)`**: Guarda un valor asociado a una clave.
* **`get<K, V>(&self, key: &K) -> Option<V>`**: Recupera un valor. Devuelve `None` si no existe. Provoca pánico si existe pero falla la conversión de tipo.
* **`has<K>(&self, key: &K) -> bool`**: Verifica si existe una clave.
* **`remove<K>(&self, key: &K)`**: Elimina una clave y su valor.

## Casos de Uso por Tipo de Storage

### Cuándo usar Instance Storage
- Configuración del contrato (admin, flags)
- Metadatos pequeños (nombre, símbolo de token)
- Datos que se acceden en casi todas las llamadas
- No usar con Balances de usuarios (usar Persistent)
- No usar con Datos temporales (usar Temporary)

### Cuándo usar Persistent Storage
- Balances de tokens
- Datos de usuarios críticos
- Registros que deben ser recuperables
- No usar con Datos efímeros (usar Temporary)
- No usar con Configuración global del contrato (usar Instance)

### Cuándo usar Temporary Storage
- Ofertas en DEX de corta duración
- Datos de oráculos que se actualizan frecuentemente
- Autorizaciones temporales
- No usar con Balances de usuarios (usar Persistent)
- No usar con Datos críticos (usar Persistent)

## Referencias Relacionadas

- **[SDK Types](sdk_types.md)**: Tipos de datos que puedes almacenar (Symbol, Map, Vec, etc.)
- **[SDK Errors](sdk_errors.md)**: Manejo de errores con `get()` que retorna `Option`
- **[SDK Env](sdk_env.md)**: Acceso al entorno para obtener `env.storage()`
- **[Example Counter](examples_counter.md)**: Uso práctico de Instance Storage
- **[Example Token](examples_token.md)**: Uso de Persistent Storage para balances
* **`update<K, V>(...)`**: Patrón funcional que carga el valor, ejecuta una función de modificación y guarda el resultado.
* **`try_update<K, V, E>(...)`**: Similar a `update`, pero permite devolver un error (`Result`) deteniendo la actualización.

### Gestión de Renta y TTL (Extend TTL)

Los datos en Soroban pagan "renta" para permanecer en la ledger.

* **Para `Persistent` y `Temporary**`:
* **`extend_ttl(&self, key, threshold, extend_to)`**: Extiende la vida de una entrada específica si su vida restante es menor que `threshold`, llevándola hasta `extend_to` ledgers.


* **Para `Instance**`:
* **`extend_ttl(&self, threshold, extend_to)`**: Extiende el TTL de la instancia del contrato y su código asociado. No requiere clave, afecta a todo el contrato.



## Utilidades de Pruebas (Testutils)

Bajo la configuración `#[cfg(any(test, feature = "testutils"))]`, se habilitan funcionalidades adicionales para inspección:

* **`all() -> Map<Val, Val>`**: Permite obtener un mapa completo con todas las entradas almacenadas en ese tipo de almacenamiento (útil para aserciones en tests).
* **`get_ttl(...) -> u32`**: Permite consultar el tiempo de vida restante exacto de una entrada o de la instancia en el entorno de pruebas.
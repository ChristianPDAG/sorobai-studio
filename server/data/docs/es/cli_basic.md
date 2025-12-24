# Stellar CLI Basics

La **Stellar CLI** es la herramienta de línea de comandos oficial para interactuar con la red Stellar y desarrollar smart contracts en Soroban. Permite compilar contratos, desplegarlos en la red (**Deploy**), invocar funciones (**Invoke**) y gestionar identidades (**Keys**).

## Instalación (Installation)

La forma más común de instalar la CLI es a través de **Cargo** (el gestor de paquetes de Rust) o **Homebrew** (en macOS).

```bash
# Instalación con Cargo (Recomendado para devs Rust)
cargo install --locked stellar-cli

# Instalación en macOS/Linux con brew
brew install stellar-cli

```

> **Nota:** El comando principal es `stellar`. En versiones anteriores se usaba `soroban`, pero ahora todo está unificado bajo `stellar` (ej. `stellar contract deploy`).

## Gestión de Identidades (Identity & Keys)

Para interactuar con la red, necesitas una identidad (par de claves pública/privada). La CLI permite gestionar estas identidades de forma segura sin manejar claves privadas en texto plano constantemente.

### Generar una identidad

Crea una nueva identidad llamada "alice" y guarda sus claves en el sistema seguro local.

```bash
stellar keys generate alice --network testnet

```

* **`--network testnet`**: Automáticamente fondea la cuenta usando Friendbot si se especifica la red de prueba.

### Listar identidades

Para ver las direcciones públicas almacenadas:

```bash
stellar keys address alice

```

## Configuración de Red (Network Configuration)

La CLI necesita saber a qué red conectarse (Local, Testnet, Mainnet).

* **Testnet:** Red pública de pruebas.
* **Local:** Red privada usando `stellar-quickstart` en Docker.

### Configurar red predeterminada (Default Network)

Puedes definir una variable de entorno o usar flags en cada comando. La práctica común es usar `--network`.

```bash
# Ejemplo de uso con flag explícita
stellar contract invoke --network testnet ...

```

## Ciclo de Vida del Contrato (Contract Lifecycle)

El flujo de trabajo estándar para un desarrollador de Soroban incluye: **Build** → **Deploy** → **Invoke**.

### 1. Compilación (Build)

Compila el contrato Rust a WebAssembly (`.wasm`). La CLI envuelve a `cargo build` para optimizar el resultado.

```bash
stellar contract build

```

Esto genera el archivo `.wasm` en `target/wasm32-unknown-unknown/release/`.

### 2. Despliegue (Deploy)

Sube el código compilado a la red y crea una instancia del contrato.

```bash
stellar contract deploy \
    --wasm target/wasm32-unknown-unknown/release/my_contract.wasm \
    --source alice \
    --network testnet

```

* **Output:** Devuelve el **Contract ID** (ej. `C123...`) que usarás para interactuar con él.

### 3. Invocación (Invoke)

Ejecuta una función pública del contrato inteligente.

```bash
stellar contract invoke \
    --id C123... \
    --source alice \
    --network testnet \
    -- \
    hello \
    --to bob

```

* **`--id`**: El ID del contrato obtenido en el paso de deploy.
* **`--`**: Separador importante. Todo lo que va después son los **argumentos de la función** del contrato (`fn name` y sus parámetros).

## Utilidades Adicionales

### Generación de Bindings

La CLI puede generar librerías cliente (SDKs) para TypeScript, Python o Rust automáticamente basadas en tu contrato.

```bash
stellar contract bindings typescript \
    --wasm my_contract.wasm \
    --output-dir ./npm-package

```

### Optimización (Optimize)

Para producción, es crucial reducir el tamaño del binario `.wasm` para minimizar costos de almacenamiento y ejecución.

```bash
stellar contract build --optimize

```

## Referencias Relacionadas

- **[Overview](overview.md)**: Introducción a Soroban y arquitectura general
- **[SDK Types](sdk_types.md)**: Tipos de datos para pasar como argumentos en `invoke`
- **[SDK Errors](sdk_errors.md)**: Cómo manejar errores durante deploy/invoke
- **[Example Counter](examples_counter.md)**: Flujo completo: build → deploy → invoke
- **[Example Token](examples_token.md)**: Caso real de deployment de token
# Introducción a los Smart Contracts de Soroban

Soroban es la plataforma de **smart contracts** integrada en la **Stellar network**. Permite a los desarrolladores escribir contratos pequeños, deterministas y seguros que se ejecutan directamente en Stellar.

Los **smart contracts** son programas auto-ejecutables donde las reglas y la lógica se definen en código. Una vez desplegados (deployed), los contratos se vuelven inmutables y públicamente accesibles, haciendo cumplir su lógica automáticamente cuando son invocados a través de transacciones.

Los contratos de Soroban se escriben en el lenguaje de programación **Rust** y se compilan a **WebAssembly (Wasm)** para su ejecución. Debido a las restricciones de ejecución en la blockchain — como los límites de recursos y requisitos de seguridad — los contratos de Soroban utilizan un subconjunto restringido de Rust y dependen de librerías especializadas en lugar de la **Rust standard library**.

## Soroban Rust SDK

Los contratos inteligentes se desarrollan utilizando el **Soroban Rust SDK**. Este SDK reemplaza la mayoría de las funcionalidades provistas normalmente por la librería estándar de Rust y expone características específicas del contrato (`contract-specific features`), incluyendo:

* Acceso al **execution environment** (el `Env`).
* **Storage** temporal y persistente *on-chain*.
* **Authorization** y verificación de firmas.
* Utilidades criptográficas (**Cryptographic utilities**).
* Invocación de otros contratos por identificador (**Cross-contract calls**).

El SDK también incluye una **Command-Line Interface (CLI)** utilizada para compilar, probar, inspeccionar y desplegar contratos. La **CLI** proporciona un entorno de pruebas local que refleja fielmente la ejecución *on-chain*, permitiendo que los contratos sean probados y depurados antes del despliegue.

## Modelo de Ejecución (Execution Model)

Soroban no es una blockchain separada. Es una extensión de la red Stellar existente y opera junto a las operaciones tradicionales de Stellar. Los contratos son invocados a través de transacciones e interactúan con **Stellar accounts** y **assets** de manera controlada y determinista.

La mayoría de los desarrolladores interactúan exclusivamente con el **Soroban SDK**, el cual abstrae el **Host environment** subyacente. Entender el modelo de ejecución de alto nivel ayuda a los desarrolladores a razonar sobre el comportamiento del contrato, el **Storage** y la **Authorization**, sin requerir conocimiento profundo de los internos de la máquina virtual (VM).

## Consideraciones de Seguridad

Debido a que los **smart contracts** son inmutables una vez desplegados, los desarrolladores deben diseñarlos cuidadosamente. Las áreas comunes de interés incluyen:

* Uso correcto de los **authorization checks** (verificaciones de autenticación).
* Manejo seguro del **contract storage**.
* Evitar patrones y asunciones inseguras (`unsafe patterns`).
* Diseñar interfaces públicas claras y predecibles.

Esta documentación se enfoca en entender y escribir **Soroban smart contracts** utilizando el SDK oficial y los patrones recomendados.

## Referencias Relacionadas

- **[CLI Basics](cli_basic.md)**: Aprende a compilar, desplegar e invocar contratos
- **[SDK Storage](sdk_storage.md)**: Gestión del estado persistente en contratos
- **[SDK Auth](sdk_auth.md)**: Sistema de autorización y verificación de identidad
- **[SDK Env](sdk_env.md)**: Entorno de ejecución y contexto del contrato
- **[SDK Types](sdk_types.md)**: Tipos de datos disponibles en Soroban
- **[SDK Errors](sdk_errors.md)**: Manejo robusto de errores
- **[Example Counter](examples_counter.md)**: Ejemplo básico de contador
- **[Example Token](examples_token.md)**: Implementación completa de token
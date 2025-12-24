# Introduction to Soroban Smart Contracts

Soroban is the **smart contract** platform integrated into the **Stellar network**. It allows developers to write small, deterministic, and secure contracts that execute directly on Stellar.

**Smart contracts** are self-executing programs where rules and logic are defined in code. Once deployed, contracts become immutable and publicly accessible, automatically enforcing their logic when invoked through transactions.

Soroban contracts are written in the **Rust** programming language and compiled to **WebAssembly (Wasm)** for execution. Due to execution constraints on the blockchain — such as resource limits and security requirements — Soroban contracts use a restricted subset of Rust and rely on specialized libraries instead of the **Rust standard library**.

## Soroban Rust SDK

Smart contracts are developed using the **Soroban Rust SDK**. This SDK replaces most functionalities normally provided by the standard Rust library and exposes **contract-specific features**, including:

* Access to the **execution environment** (the `Env`).
* Temporary and persistent *on-chain* **Storage**.
* **Authorization** and signature verification.
* **Cryptographic utilities**.
* Invocation of other contracts by identifier (**Cross-contract calls**).

The SDK also includes a **Command-Line Interface (CLI)** used to compile, test, inspect, and deploy contracts. The **CLI** provides a local test environment that faithfully reflects *on-chain* execution, allowing contracts to be tested and debugged before deployment.

## Execution Model

Soroban is not a separate blockchain. It is an extension of the existing Stellar network and operates alongside traditional Stellar operations. Contracts are invoked through transactions and interact with **Stellar accounts** and **assets** in a controlled and deterministic way.

Most developers interact exclusively with the **Soroban SDK**, which abstracts the underlying **Host environment**. Understanding the high-level execution model helps developers reason about contract behavior, **Storage**, and **Authorization**, without requiring deep knowledge of the virtual machine (VM) internals.

## Security Considerations

Because **smart contracts** are immutable once deployed, developers must design them carefully. Common areas of interest include:

* Correct use of **authorization checks**.
* Secure handling of **contract storage**.
* Avoiding unsafe patterns and assumptions.
* Designing clear and predictable public interfaces.

This documentation focuses on understanding and writing **Soroban smart contracts** using the official SDK and recommended patterns.

## Related References

* **[CLI Basics](cli_basic.md)**: Learn to compile, deploy, and invoke contracts
* **[SDK Storage](sdk_storage.md)**: Persistent state management in contracts
* **[SDK Auth](sdk_auth.md)**: Authorization system and identity verification
* **[SDK Env](sdk_env.md)**: Execution environment and contract context
* **[SDK Types](sdk_types.md)**: Data types available in Soroban
* **[SDK Errors](sdk_errors.md)**: Robust error handling
* **[Example Counter](examples_counter.md)**: Basic counter example
* **[Example Token](examples_token.md)**: Complete token implementation
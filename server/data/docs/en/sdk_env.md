# Execution Environment (Env) in Soroban SDK

## Overview

The `Env` type is the core structure of the Soroban SDK. It provides access to the environment in which the smart contract is executing. It acts as the bridge between the contract code (Guest) and the Soroban Host (the blockchain or the local test environment).

Most types and operations in Soroban require access to an `Env` instance to be constructed, converted, or executed.

## Architecture and Behavior

### Guest vs. Host Model

The behavior of `Env` changes depending on the compilation target (`target_family`):

1. **WASM (`target_family = "wasm"`):** `Env` is a lightweight wrapper (`Guest`) that makes direct calls to functions exported by the WASM host. In this mode, error handling is minimal as failures usually result in a VM "trap".
2. **Native/Test (`not(target_family = "wasm")`):** `Env` wraps a full instance of the `Host`. This allows for environment simulation, advanced debugging, backtraces, and unit testing on local machines without needing to deploy to the network.

### Cloning

The `Env` structure is designed to be cloned efficiently (`#[derive(Clone)]`). It does not copy the full ledger state, but only the references or handles necessary to interact with the environment.

## Main Functionalities

The `Env` exposes methods to access critical contract subsystems:

### 1. Storage and Persistence

* **`storage(&self) -> Storage`**: Returns an instance to access and update persistent data owned by the current contract (Instance, Temporary, Persistent).

### 2. Ledger Context

* **`ledger(&self) -> Ledger`**: Provides access to current ledger information, such as sequence number, timestamps, and network configuration.
* **`current_contract_address(&self) -> Address`**: Returns the `Address` object corresponding to the currently executing contract.

### 3. Event and Log Emission

* **`events(&self) -> Events`**: Allows publishing events associated with the current contract, which are externally visible.
* **`logs(&self) -> Logs`**: Provides access to the logging system for debugging (debug events).

### 4. Cryptography and Randomness

* **`crypto(&self) -> Crypto`**: Access to standard cryptographic functions (hashing, signature verification).
* **`prng(&self) -> Prng`**: Access to the pseudo-random number generator. **Note:** Must not be used for private key generation or critical security operations outside the contract context.

### 5. Cross-Contract Calls

The `Env` allows calling functions of other deployed contracts:

* **`invoke_contract<T>(...) -> T`**: Invokes a function of another contract. If the call fails or the return type does not match, it causes a panic (trap).
* **`try_invoke_contract<T, E>(...) -> Result<...>`**: Similar to the above, but captures execution errors, allowing the contract to handle sub-call failures in a controlled manner.

## Essential Env Methods

### Accessing Storage

```rust
let storage = env.storage().instance();
let balance: u32 = storage.get(&symbol_short!("balance")).unwrap_or(0);

```

### Get Contract Context

```rust
let current_address = env.current_contract_address();
let ledger_timestamp = env.ledger().timestamp();

```

### Event Emission

```rust
env.events().publish((symbol_short!("transfer"),), (from, to, amount));

```

## Related References

* **[SDK Storage](https://www.google.com/search?q=sdk_storage.md)**: Detailed usage of `env.storage()`
* **[SDK Auth](https://www.google.com/search?q=sdk_auth.md)**: Authorization using `Address` from Env
* **[SDK Types](https://www.google.com/search?q=sdk_types.md)**: Types constructed with `&env`
* **[SDK Errors](https://www.google.com/search?q=sdk_errors.md)**: Error handling with `Result` and panic
* **[Example Counter](https://www.google.com/search?q=examples_counter.md)**: Basic usage of `Env`
* **[Example Token](https://www.google.com/search?q=examples_token.md)**: Advanced usage of events and storage

### 6. Authorization (Auth)

* **`require_auth(&self, address: &Address)`**: Verifies that the provided address has authorized the current call.
* **`authorize_as_current_contract(&self, ...)`**: Authorizes deep calls (sub-contracts) on behalf of the current contract.

## Test Utilities (Testutils)

When compiled with the `testutils` feature or in `test` configuration, `Env` acquires extended capabilities for simulation and unit testing.

### Configuration and Creation

* **`Env::default()`**: In tests, creates a new environment with default configuration (including snapshots on completion).
* **`new_with_config(EnvTestConfig)`**: Allows customizing the test environment behavior.

### Contract Registration (Mocking)

* **`register(contract, args)`**: Registers a contract defined in the current crate (Rust struct) within the test environment.
* **`register_at(contract_id, contract, args)`**: Registers a contract at a specific address.
* **`mock_auths(&self, auths: &[MockAuth])`**: Allows simulating authorizations for tests, avoiding the need for actual cryptographic signatures.
* **`mock_all_auths(&self)`**: Makes all calls to `require_auth` succeed automatically. Useful for testing business logic without setting up complex authorization trees.

### Snapshots

The `Env` allows saving and loading the full environment state (ledger, events, storage) for regression testing:

* **`to_snapshot_file(path)`**: Writes the current state to a JSON file.
* **`from_snapshot_file(path)`**: Restores an `Env` from a file.
* **`cost_estimate(&self)`**: Returns an estimate of resources (CPU, Memory) consumed during execution, useful for gas optimization.

## Internal Error Handling

The module internally defines how unrecoverable errors are handled:

* In **WASM**, an error results in an `unreachable` state, stopping execution.
* In **Test/Host**, `escalate_error_to_panic` is used to simulate the VM "crash" behavior, but allows capturing the error in the test runner for inspection.

## Related Traits

`Env` implements and uses auxiliary traits for type conversion between Host and Guest:

* **`IntoVal<E, T>`**: Converts a Rust type to a Soroban value (`Val`).
* **`FromVal<E, T>`**: Converts a Soroban value (`Val`) to a Rust type.
# Storage in Soroban SDK

## Overview

The `src/storage.rs` module defines the interface for storing and retrieving data within an executing smart contract. This system is fundamental for contract **state management**.

### Isolation Principle

Storage is private to each contract. A contract can only query and modify its own data; there is no direct access to other contracts' storage.

## Storage Types

Soroban offers three storage categories, each optimized for different use cases, costs, and lifecycles:

### 1. Temporary

* **Characteristics:** The cheapest option.
* **Lifecycle:** When an entry expires, it is permanently deleted and cannot be recovered (it does not enter the *Expired State Stack*).
* **Use Case:** Data only relevant for short periods or that can be arbitrarily recreated (e.g., oracle data, DEX offers, temporary authorizations).

### 2. Persistent

* **Characteristics:** More expensive than temporary.
* **Lifecycle:** If an entry expires, it is removed from the active state but sent to the *Expired State Stack* (ESS). It can be recovered (restored) via a Stellar Core operation.
* **Use Case:** Critical data that must persist indefinitely, such as token balances or user properties.

### 3. Instance

* **Characteristics:** Storage directly linked to the contract instance entry.
* **Behavior:** Loaded from the ledger **every time** the contract is loaded, regardless of whether it is used. It does not count additionally towards the read *footprint*.
* **Limit:** Space is limited by the maximum size of a ledger entry (approx. 100 KB serialized).
* **Use Case:** Small, frequently accessed global data, such as the contract admin, configuration (flags), or token metadata.

## Storage Structure & API

The `Storage` structure acts as the main entry point (`env.storage()`) and exposes methods to access specific subsystems:

* **`persistent() -> Persistent`**
* **`temporary() -> Temporary`**
* **`instance() -> Instance`**
* **`max_ttl() -> u32`**: Returns the maximum possible TTL (Time To Live) for an entry on the current network.

### Common CRUD Operations

The `Persistent`, `Temporary`, and `Instance` structures share a consistent generic API:

* **`set<K, V>(&self, key: &K, val: &V)`**: Saves a value associated with a key.
* **`get<K, V>(&self, key: &K) -> Option<V>`**: Retrieves a value. Returns `None` if it does not exist. Panics if it exists but type conversion fails.
* **`has<K>(&self, key: &K) -> bool`**: Checks if a key exists.
* **`remove<K>(&self, key: &K)`**: Deletes a key and its value.

## Use Cases by Storage Type

### When to use Instance Storage

* Contract configuration (admin, flags)
* Small metadata (token name, symbol)
* Data accessed in almost every call
* Do not use for User balances (use Persistent)
* Do not use for Temporary data (use Temporary)

### When to use Persistent Storage

* Token balances
* Critical user data
* Records that must be recoverable
* Do not use for Ephemeral data (use Temporary)
* Do not use for Global contract configuration (use Instance)

### When to use Temporary Storage

* Short-lived DEX offers
* Oracle data updated frequently
* Temporary authorizations
* Do not use for User balances (use Persistent)
* Do not use for Critical data (use Persistent)

## Related References

* **[SDK Types](https://www.google.com/search?q=sdk_types.md)**: Data types you can store (Symbol, Map, Vec, etc.)
* **[SDK Errors](https://www.google.com/search?q=sdk_errors.md)**: Error handling with `get()` returning `Option`
* **[SDK Env](https://www.google.com/search?q=sdk_env.md)**: Environment access to obtain `env.storage()`
* **[Example Counter](https://www.google.com/search?q=examples_counter.md)**: Practical use of Instance Storage
* **[Example Token](https://www.google.com/search?q=examples_token.md)**: Use of Persistent Storage for balances

* **`update<K, V>(...)`**: Functional pattern that loads the value, executes a modification function, and saves the result.
* **`try_update<K, V, E>(...)`**: Similar to `update`, but allows returning an error (`Result`) stopping the update.

### Rent Management and TTL (Extend TTL)

Data in Soroban pays "rent" to remain on the ledger.

* **For `Persistent` and `Temporary**`:
* **`extend_ttl(&self, key, threshold, extend_to)`**: Extends the life of a specific entry if its remaining life is less than `threshold`, bringing it up to `extend_to` ledgers.
* **For `Instance**`:
* **`extend_ttl(&self, threshold, extend_to)`**: Extends the TTL of the contract instance and its associated code. Requires no key, affects the entire contract.

## Test Utilities (Testutils)

Under the `#[cfg(any(test, feature = "testutils"))]` configuration, additional functionalities for inspection are enabled:

* **`all() -> Map<Val, Val>`**: Allows obtaining a complete map with all entries stored in that storage type (useful for assertions in tests).
* **`get_ttl(...) -> u32`**: Allows querying the exact remaining lifespan of an entry or the instance in the test environment.
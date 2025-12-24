# Soroban Counter Example (Counter)

This example demonstrates a basic smart contract in Soroban that stores an integer and increments it every time it is invoked. It is the fundamental example for understanding how **State Management** works in Soroban.

## Key Concepts

* **Instance Storage:** Used to save the counter value. Since it is a unique and global datum for this contract, instance storage is the most suitable and efficient.
* **Symbol:** A static key (a `Symbol`) is used to identify the value in storage.
* **State Mutation:** Reading, modifying, and writing data in the `Env`.

## Contract Code

The contract defines a constant for the storage key and a public `increment` function.

```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol};

// Define the storage key as a short and efficient Symbol
const COUNTER: Symbol = symbol_short!("COUNTER");

#[contract]
pub struct IncrementContract;

#[contractimpl]
impl IncrementContract {
    /// Increments the internal counter and returns the new value.
    pub fn increment(env: Env) -> u32 {
        // 1. Get the instance storage
        let storage = env.storage().instance();

        // 2. Read the current value. If it doesn't exist, we use 0 by default.
        // `get` returns an Option, so we use unwrap_or(0).
        let mut count: u32 = storage.get(&COUNTER).unwrap_or(0);

        // 3. Modify the value (business logic)
        count += 1;

        // 4. Save the new value in storage
        storage.set(&COUNTER, &count);

        // 5. Extend the instance TTL (Time To Live)
        // This ensures the contract doesn't expire soon.
        storage.extend_ttl(100, 100);

        // 6. Return the result
        count
    }
}


```

### Step Explanation

1. **`env.storage().instance()`**: Accesses the contract instance storage space.
2. **`get(&COUNTER)`**: Retrieves the value associated with the key. Returns an `Option<u32>`.
3. **`set(&COUNTER, &count)`**: Persists the new value in the **Ledger**.
4. **`extend_ttl`**: **Rent** maintenance; extends the storage lifespan to prevent it from being archived.

## Testing

Soroban allows testing the contract locally using a simulated **Host**.

```rust
#[test]
fn test() {
    // 1. Create a test environment (Test Environment)
    let env = Env::default();
    
    // 2. Register the contract in the environment
    let contract_id = env.register_contract(None, IncrementContract);
    
    // 3. Create a client to invoke the contract
    let client = IncrementContractClient::new(&env, &contract_id);

    // 4. Invoke the function and verify results
    assert_eq!(client.increment(), 1);
    assert_eq!(client.increment(), 2);
    assert_eq!(client.increment(), 3);
}


```

The automatically generated `Client` (`IncrementContractClient`) allows calling contract functions as if they were native Rust methods, greatly facilitating test writing.

## Real Use Cases

This co**Unique ID Counters**: Generating sequential IDs for NFTs or records
* **Contract Statistics**: Number of operations performed
* **Rate limiting**: Usage counter for call limits
* **Versioning**: Tracking contract state version

## Common Variations

### Counter with Custom Increment

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

### Counter with Decrement

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

## Related References

* **[SDK Storage](sdk_storage.md)**: Instance Storage and `.get()`, `.set()` methods
* **[SDK Types](sdk_types.md)**: Types like `u32` and `Symbol`
* **[SDK Env](sdk_env.md)**: Using the `Env` environment
* **[SDK Errors](sdk_errors.md)**: Error handling with `Result`
* **[CLI Basics](cli_basic.md)**: How to deploy and test this contract
* **[Example Token](examples_token.md)**: More complex example with multiple functions
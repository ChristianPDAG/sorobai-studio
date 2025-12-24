# Data Types in Soroban SDK

Soroban smart contracts use SDK-specific data types that are optimized for the blockchain environment. These types ensure efficient serialization, optimal storage, and compatibility with the Soroban VM.

## Primitive Types

### Integers

Soroban supports integers of different sizes, all **unsigned** by default for safe operations.

```rust
use soroban_sdk::{contract, contractimpl, Env};

#[contract]
pub struct Calculator;

#[contractimpl]
impl Calculator {
    pub fn add_numbers(env: Env, a: u32, b: u32) -> u32 {
        a + b
    }
    
    pub fn large_number(env: Env) -> u64 {
        1_000_000_000_u64
    }
    
    pub fn small_value(env: Env) -> i32 {
        -42 // Signed integers are also available
    }
}

```

**Available types:** `u32`, `u64`, `u128`, `i32`, `i64`, `i128`

> **Important:** Do not use standard Rust types like `usize` in public interfaces. Always use explicit SDK types.

### Boolean

For simple conditional logic.

```rust
pub fn is_active(env: Env, user: Address) -> bool {
    env.storage()
        .persistent()
        .has(&user)
}

```

## Symbol

A **Symbol** is an efficient identifier of up to 32 characters. It is commonly used as a storage key or event identifier.

```rust
use soroban_sdk::{Symbol, symbol_short};

#[contractimpl]
impl MyContract {
    pub fn store_value(env: Env, value: u32) {
        let key = Symbol::new(&env, "balance");
        // Or use the macro for short symbols (more efficient)
        let key_short = symbol_short!("balance");
        
        env.storage().instance().set(&key_short, &value);
    }
}

```

**Features:**

* Maximum 32 ASCII characters
* Lowercase, numbers, and `_` only
* Much more efficient than String for keys
* Use `symbol_short!()` for compile-time known symbols

## String

Immutable text strings for arbitrary data.

```rust
use soroban_sdk::String;

#[contractimpl]
impl MyContract {
    pub fn greet(env: Env, name: String) -> String {
        let mut greeting = String::from_str(&env, "Hello, ");
        greeting.push_str(&name);
        greeting
    }
    
    pub fn get_name(env: Env) -> String {
        String::from_str(&env, "Soroban")
    }
}

```

**Cost Warning:** Strings consume more gas than Symbols. Use them only when you need arbitrary or long text.

## Address

Represents an account or contract on Stellar. It is the fundamental type for identity and authorization.

```rust
use soroban_sdk::Address;

#[contractimpl]
impl TokenContract {
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth(); // Verifies that 'from' authorized this operation
        
        // Transfer logic...
    }
    
    pub fn get_admin(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&symbol_short!("admin"))
            .unwrap()
    }
}

```

**Key Operations:**

* `.require_auth()`: Validates authorization
* `.require_auth_for_args()`: Authorization with specific arguments

## Vec (Vector)

Dynamic list of elements of the same type.

```rust
use soroban_sdk::Vec;

#[contractimpl]
impl ListContract {
    pub fn sum_numbers(env: Env, numbers: Vec<u32>) -> u32 {
        let mut total = 0u32;
        for num in numbers.iter() {
            total += num;
        }
        total
    }
    
    pub fn create_list(env: Env) -> Vec<u32> {
        let mut vec = Vec::new(&env);
        vec.push_back(10);
        vec.push_back(20);
        vec.push_back(30);
        vec
    }
    
    pub fn get_first(env: Env, items: Vec<String>) -> Option<String> {
        items.first()
    }
}

```

**Common Methods:**

* `.push_back()`, `.push_front()`
* `.pop_back()`, `.pop_front()`
* `.get(index)` → `Option<T>`
* `.len()`
* `.iter()`

## Map (Dictionary)

Key-value structure for storing data pairs.

```rust
use soroban_sdk::Map;

#[contractimpl]
impl RegistryContract {
    pub fn register_users(env: Env) -> Map<Address, u32> {
        let mut registry = Map::new(&env);
        
        let alice = Address::from_string(&String::from_str(&env, "GABC..."));
        let bob = Address::from_string(&String::from_str(&env, "GDEF..."));
        
        registry.set(alice, 100);
        registry.set(bob, 250);
        
        registry
    }
    
    pub fn get_balance(env: Env, user: Address) -> u32 {
        let balances: Map<Address, u32> = env.storage()
            .persistent()
            .get(&symbol_short!("balances"))
            .unwrap_or(Map::new(&env));
            
        balances.get(user).unwrap_or(0)
    }
}

```

**Common Methods:**

* `.set(key, value)`
* `.get(key)` → `Option<Value>`
* `.has(key)` → `bool`
* `.remove(key)`
* `.keys()` → `Vec<Key>`
* `.values()` → `Vec<Value>`

## Bytes and BytesN

For arbitrary binary data.

```rust
use soroban_sdk::{Bytes, BytesN};

#[contractimpl]
impl DataContract {
    // BytesN: Fixed size known at compile time
    pub fn store_hash(env: Env, hash: BytesN<32>) {
        env.storage().persistent().set(&symbol_short!("hash"), &hash);
    }
    
    // Bytes: Variable size
    pub fn store_data(env: Env, data: Bytes) {
        env.storage().persistent().set(&symbol_short!("data"), &data);
    }
}

```

**When to use each:**

* `BytesN<N>`: For hashes, cryptographic keys (fixed size)
* `Bytes`: For variable-length binary data

## Option and Result

For handling optional values and errors.

```rust
use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotFound = 1,
    Unauthorized = 2,
}

#[contractimpl]
impl MyContract {
    // Option: Value that might not exist
    pub fn find_user(env: Env, id: u32) -> Option<Address> {
        env.storage().persistent().get(&id)
    }
    
    // Result: Operation that can fail
    pub fn withdraw(env: Env, user: Address, amount: u32) -> Result<(), Error> {
        user.require_auth();
        
        let balance: u32 = env.storage()
            .persistent()
            .get(&user)
            .ok_or(Error::NotFound)?;
        
        if balance < amount {
            return Err(Error::Unauthorized);
        }
        
        env.storage().persistent().set(&user, &(balance - amount));
        Ok(())
    }
}

```

## Custom Structures (Custom Types)

You can define your own data types with `#[contracttype]`.

```rust
use soroban_sdk::contracttype;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct User {
    pub address: Address,
    pub balance: u64,
    pub active: bool,
}

#[contracttype]
pub enum Status {
    Pending,
    Approved,
    Rejected,
}

#[contractimpl]
impl MyContract {
    pub fn create_user(env: Env, addr: Address) -> User {
        User {
            address: addr,
            balance: 0,
            active: true,
        }
    }
    
    pub fn store_user(env: Env, user: User) {
        env.storage().persistent().set(&user.address, &user);
    }
    
    pub fn get_status(env: Env) -> Status {
        Status::Pending
    }
}

```

**Requirements:**

* All fields must be valid Soroban types
* Derive `Clone` to allow copies
* Mandatory usage of `#[contracttype]`

## Quick Comparison Table

| Type | Use Case | Gas Cost | Max Size |
| --- | --- | --- | --- |
| `u32`, `i32` | Small numbers | Low | 32 bits |
| `u64`, `i64` | Medium numbers | Low | 64 bits |
| `u128`, `i128` | Large amounts (tokens) | Medium | 128 bits |
| `Symbol` | Keys, identifiers | Very Low | 32 chars |
| `String` | Arbitrary text | High | Variable |
| `Address` | Accounts/contracts | Low | 32 bytes |
| `Vec<T>` | Dynamic lists | Medium-High | Variable |
| `Map<K,V>` | Dictionaries | Medium-High | Variable |
| `BytesN<N>` | Fixed binary data | Low | N bytes |
| `Bytes` | Variable binary data | Medium | Variable |

## Common Errors

### Error: Using standard Rust types

```rust
// BAD: Does not compile
pub fn bad_function(env: Env, text: std::string::String) -> usize {
    text.len()
}

```

### Correct: Using SDK types

```rust
// GOOD: Uses Soroban types
pub fn good_function(env: Env, text: String) -> u32 {
    text.len()
}

```

### Error: Symbol too long

```rust
// BAD: Runtime panic
let key = Symbol::new(&env, "this_is_a_very_long_key_name_that_exceeds_limit");

```

### Correct: Short Symbol

```rust
// GOOD: Max 32 characters
let key = symbol_short!("balance");

```

## Best Practices

1. **Use `Symbol` instead of `String` for storage keys**
2. **Prefer `u64`/`u128` for token amounts** and balances
3. **Use `contracttype` for complex data** that is repeated
4. **Minimize the usage of `Vec` and `Map**` in storage (high cost)
5. **Always use `Address.require_auth()**` before sensitive operations

## Related References

* See [`sdk_storage.md`](/server/data/docs/en/sdk_storage.md) for how to store these types
* See [`sdk_errors.md`](/server/data/docs/en/sdk_errors.md) for error handling with `Result`
* See [`examples_token.md`](/server/data/docs/en/examples_token.md) for usage of `i128` in tokens
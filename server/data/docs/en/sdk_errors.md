# Error Handling in Soroban

Robust error handling is critical in smart contracts because failed transactions can result in loss of funds or inconsistent states. Soroban provides the `#[contracterror]` macro to safely define custom errors.

## Defining Custom Errors

Errors in Soroban are defined as enums with the `#[contracterror]` macro.

```rust
use soroban_sdk::{contract, contractimpl, contracterror, Env, Address};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Unauthorized = 3,
    InsufficientBalance = 4,
    InvalidAmount = 5,
    NotFound = 6,
}

```

**Important rules:**

* Each error must have a unique `u32` code
* Start from `1` (`0` is reserved)
* Use descriptive names indicating the exact problem
* Derive required traits: `Copy, Clone, Debug, Eq, PartialEq`

## Basic Usage: Result Type

Functions that can fail must return `Result<T, Error>`.

```rust
#[contract]
pub struct TokenContract;

#[contractimpl]
impl TokenContract {
    pub fn transfer(
        env: Env,
        from: Address,
        to: Address,
        amount: i128,
    ) -> Result<(), Error> {
        // Validate authorization
        from.require_auth();
        
        // Validate amount
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        
        // Get current balance
        let balance = Self::get_balance(&env, &from);
        
        // Check sufficient funds
        if balance < amount {
            return Err(Error::InsufficientBalance);
        }
        
        // Perform transfer
        Self::set_balance(&env, &from, balance - amount);
        
        let to_balance = Self::get_balance(&env, &to);
        Self::set_balance(&env, &to, to_balance + amount);
        
        Ok(())
    }
}

```

## Error Propagation with `?`

The `?` operator allows automatically propagating errors upwards.

```rust
#[contractimpl]
impl TokenContract {
    pub fn withdraw(env: Env, user: Address, amount: i128) -> Result<(), Error> {
        user.require_auth();
        
        // The ? operator returns the error if get_balance fails
        let balance = Self::get_balance_checked(&env, &user)?;
        
        if balance < amount {
            return Err(Error::InsufficientBalance);
        }
        
        Self::set_balance(&env, &user, balance - amount);
        Ok(())
    }
    
    fn get_balance_checked(env: &Env, addr: &Address) -> Result<i128, Error> {
        env.storage()
            .persistent()
            .get(addr)
            .ok_or(Error::NotFound)  // Converts Option to Result
    }
}

```

## Converting between Option and Result

It is common to convert between `Option` (returned by storage) and `Result`.

```rust
use soroban_sdk::symbol_short;

#[contractimpl]
impl MyContract {
    // Method 1: ok_or() - Converts None to specific Error
    pub fn get_admin(env: Env) -> Result<Address, Error> {
        env.storage()
            .instance()
            .get(&symbol_short!("admin"))
            .ok_or(Error::NotInitialized)
    }
    
    // Method 2: ok_or_else() - Generates error lazily
    pub fn get_config(env: Env) -> Result<u32, Error> {
        env.storage()
            .instance()
            .get(&symbol_short!("config"))
            .ok_or_else(|| Error::NotInitialized)
    }
    
    // Method 3: unwrap_or() - Default value without error
    pub fn get_counter(env: Env) -> u32 {
        env.storage()
            .persistent()
            .get(&symbol_short!("counter"))
            .unwrap_or(0)  // Does not return Error, uses default value
    }
}

```

## Pattern: Initialize Once

Common pattern for initialization functions that should only be called once.

```rust
use soroban_sdk::symbol_short;

#[contractimpl]
impl MyContract {
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        // Verify it is not already initialized
        if env.storage().instance().has(&symbol_short!("admin")) {
            return Err(Error::AlreadyInitialized);
        }
        
        admin.require_auth();
        env.storage().instance().set(&symbol_short!("admin"), &admin);
        
        Ok(())
    }
    
    // Helper to verify initialization
    fn ensure_initialized(env: &Env) -> Result<(), Error> {
        if !env.storage().instance().has(&symbol_short!("admin")) {
            return Err(Error::NotInitialized);
        }
        Ok(())
    }
    
    pub fn some_operation(env: Env) -> Result<(), Error> {
        Self::ensure_initialized(&env)?;
        // ... rest of the logic
        Ok(())
    }
}

```

## Pattern: Access Control

Validate permissions before sensitive operations.

```rust
#[contractimpl]
impl MyContract {
    fn require_admin(env: &Env, caller: &Address) -> Result<(), Error> {
        let admin: Address = env.storage()
            .instance()
            .get(&symbol_short!("admin"))
            .ok_or(Error::NotInitialized)?;
        
        if caller != &admin {
            return Err(Error::Unauthorized);
        }
        
        Ok(())
    }
    
    pub fn admin_only_action(env: Env, caller: Address, value: u32) -> Result<(), Error> {
        caller.require_auth();
        Self::require_admin(&env, &caller)?;
        
        // Only the admin can reach here
        env.storage().instance().set(&symbol_short!("value"), &value);
        Ok(())
    }
}

```

## Pattern: Multiple Validations

Validate multiple conditions clearly.

```rust
#[contractimpl]
impl TokenContract {
    pub fn mint(
        env: Env,
        admin: Address,
        to: Address,
        amount: i128,
    ) -> Result<(), Error> {
        // 1. Validate authorization
        admin.require_auth();
        
        // 2. Validate permissions
        Self::require_admin(&env, &admin)?;
        
        // 3. Validate parameters
        Self::validate_mint_params(&amount)?;
        
        // 4. Execute operation
        let balance = Self::get_balance(&env, &to);
        Self::set_balance(&env, &to, balance + amount);
        
        Ok(())
    }
    
    fn validate_mint_params(amount: &i128) -> Result<(), Error> {
        if *amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        if *amount > 1_000_000_000 {
            return Err(Error::InvalidAmount);
        }
        Ok(())
    }
}

```

## Panic vs Result

In Soroban there are two ways to handle errors:

### 1. Panic (Abort Execution)

```rust
pub fn dangerous_function(env: Env, value: u32) {
    // Panic if condition is not met (abort transaction)
    assert!(value > 0, "Value must be positive");
    
    // Or using unwrap (panic if None)
    let data = env.storage()
        .instance()
        .get(&symbol_short!("data"))
        .unwrap();  // Panic if it doesn't exist
}

```

**When to use panic:**

* Errors that "should never happen" (code invariants)
* During development/testing
* When code is in a corrupt state

### 2. Result (Graceful Error)

```rust
pub fn safe_function(env: Env, value: u32) -> Result<(), Error> {
    // Returns error that the caller can handle
    if value == 0 {
        return Err(Error::InvalidAmount);
    }
    
    let data = env.storage()
        .instance()
        .get(&symbol_short!("data"))
        .ok_or(Error::NotFound)?;  // Handleable error
    
    Ok(())
}

```

**When to use Result:**

* Expected errors (business conditions)
* User input validations
* Contract state that can vary
* **Production: Always prefer Result**

## Common Errors

### Error: Duplicate Code

```rust
#[contracterror]
#[derive(Copy, Clone)]
#[repr(u32)]
pub enum Error {
    NotFound = 1,
    Invalid = 1,  // Duplicate code! Will cause bugs
}

```

### Correct: Unique Codes

```rust
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    NotFound = 1,
    Invalid = 2,  // Unique code
}

```

### Error: Using unwrap in production

```rust
pub fn risky_function(env: Env) -> u32 {
    // Panic if admin does not exist
    let admin: Address = env.storage().instance().get(&symbol_short!("admin")).unwrap();
    0
}

```

### Correct: Handle error explicitly

```rust
pub fn safe_function(env: Env) -> Result<u32, Error> {
    // Returns handleable error
    let admin: Address = env.storage()
        .instance()
        .get(&symbol_short!("admin"))
        .ok_or(Error::NotInitialized)?;
    Ok(0)
}

```

### Error: Not validating inputs

```rust
pub fn transfer(env: Env, amount: i128) {
    // Does not validate that amount is positive
    // Could allow negative transfers!
}

```

### Correct: Always validate

```rust
pub fn transfer(env: Env, amount: i128) -> Result<(), Error> {
    // Validates explicitly
    if amount <= 0 {
        return Err(Error::InvalidAmount);
    }
    Ok(())
}

```

## Error Testing

How to test that your errors work correctly.

```rust
#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::{Address as _, Env as _};

    #[test]
    fn test_insufficient_balance() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TokenContract);
        let client = TokenContractClient::new(&env, &contract_id);
        
        let user = Address::generate(&env);
        let recipient = Address::generate(&env);
        
        // Attempting to transfer without funds must fail
        let result = client.try_transfer(&user, &recipient, &100);
        
        // Verify it returns the correct error
        assert_eq!(result, Err(Ok(Error::InsufficientBalance)));
    }
    
    #[test]
    fn test_unauthorized() {
        let env = Env::default();
        let contract_id = env.register_contract(None, MyContract);
        let client = MyContractClient::new(&env, &contract_id);
        
        let admin = Address::generate(&env);
        let user = Address::generate(&env);
        
        client.initialize(&admin);
        
        // Non-admin user attempting admin-only action
        let result = client.try_admin_only_action(&user, &42);
        
        assert_eq!(result, Err(Ok(Error::Unauthorized)));
    }
    
    #[test]
    #[should_panic(expected = "AlreadyInitialized")]
    fn test_double_initialization() {
        let env = Env::default();
        let contract_id = env.register_contract(None, MyContract);
        let client = MyContractClient::new(&env, &contract_id);
        
        let admin = Address::generate(&env);
        
        client.initialize(&admin);
        client.initialize(&admin);  // Second time must panic
    }
}

```

## Recommended Common Error Catalog

To standardize contracts, consider these base errors:

```rust
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    // Initialization (1-10)
    NotInitialized = 1,
    AlreadyInitialized = 2,
    
    // Authorization (11-20)
    Unauthorized = 11,
    PermissionDenied = 12,
    
    // Validation (21-40)
    InvalidAmount = 21,
    InvalidAddress = 22,
    InvalidParameter = 23,
    AmountTooLow = 24,
    AmountTooHigh = 25,
    
    // Contract State (41-60)
    InsufficientBalance = 41,
    NotFound = 42,
    AlreadyExists = 43,
    Expired = 44,
    NotActive = 45,
    
    // Operations (61-80)
    TransferFailed = 61,
    MintFailed = 62,
    BurnFailed = 63,
    
    // Others (81+)
    Unknown = 81,
}

```

## Best Practices

1. **Always use `Result<T, Error>` in production**, not panics
2. **Unique and sequential error codes**
3. **Descriptive names** indicating the exact cause
4. **Validate inputs** before any critical operation
5. **Use `?` operator** to propagate errors cleanly
6. **Test all error cases** in your tests
7. **Document which errors** each public function can return

## Complete Example

```rust
use soroban_sdk::{contract, contractimpl, contracterror, Env, Address, symbol_short};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Unauthorized = 3,
    InsufficientBalance = 4,
    InvalidAmount = 5,
}

#[contract]
pub struct TokenContract;

#[contractimpl]
impl TokenContract {
    /// Initialize the contract with an admin
    /// Returns Error::AlreadyInitialized if called twice
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        if env.storage().instance().has(&symbol_short!("admin")) {
            return Err(Error::AlreadyInitialized);
        }
        
        admin.require_auth();
        env.storage().instance().set(&symbol_short!("admin"), &admin);
        Ok(())
    }
    
    /// Transfer tokens from one account to another
    /// Returns Error::InvalidAmount if amount <= 0
    /// Returns Error::InsufficientBalance if sender has insufficient funds
    pub fn transfer(
        env: Env,
        from: Address,
        to: Address,
        amount: i128,
    ) -> Result<(), Error> {
        from.require_auth();
        
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        
        let from_balance = Self::get_balance(&env, &from);
        if from_balance < amount {
            return Err(Error::InsufficientBalance);
        }
        
        Self::set_balance(&env, &from, from_balance - amount);
        
        let to_balance = Self::get_balance(&env, &to);
        Self::set_balance(&env, &to, to_balance + amount);
        
        Ok(())
    }
    
    // Helper functions
    fn get_balance(env: &Env, addr: &Address) -> i128 {
        env.storage().persistent().get(addr).unwrap_or(0)
    }
    
    fn set_balance(env: &Env, addr: &Address, amount: i128) {
        env.storage().persistent().set(addr, &amount);
    }
}

```

## Related References

* See [`sdk_types.md`](/server/data/docs/en/sdk_types.md) for data types like `Result` and `Option`
* See [`examples_token.md`](/server/data/docs/en/examples_token.md) for real error usage in tokens
* See [`sdk_auth.md`](/server/data/docs/en/sdk_auth.md) for handling authorization errors
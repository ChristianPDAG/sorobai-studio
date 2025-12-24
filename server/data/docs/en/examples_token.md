# Soroban Token Example

In Soroban, tokens are implemented as **smart contracts** that follow a standardized interface defined in the Soroban SDK. This allows wallets, applications, and other contracts to interact with tokens in a predictable way, similar to ERC-20 standards.

There are two common types of tokens in Stellar:

* **Stellar Asset Contract (SAC):** Built-in contracts that represent native Stellar assets (XLM and issued assets).
* **Custom Tokens:** User-defined **smart contracts** that implement the token interface.

This example focuses on typical patterns for implementing a **Custom Token**.

## Core Token Concepts

A Soroban token contract usually provides:

* **Balance** tracking for accounts.
* Token **Transfers** between accounts.
* Optional **minting** and **burning** functions.
* Emission of **Events** for indexing and observability.

## Authorization Pattern

Token transfers must be authorized by the account owning the funds. Soroban uses `require_auth` to efficiently enforce this rule.

```rust
// The 'from' address must sign the transaction
from.require_auth();


```

This ensures that the caller has explicitly authorized the action, preventing unauthorized spending.

## Storage Pattern

Token contracts save balances and metadata using the contract's **Storage**.

Common patterns include:

* **Instance Storage:** Used for global state (admin address, token metadata like name/symbol).
* **Persistent Storage:** Used for user **balances**.
* **TTL Extension:** Contracts often extend the storage Time To Live (**TTL**) on reads and writes to keep data alive in the **ledger**.

## Transfer Example

A simplified transfer implementation follows these steps:

1. Verify authorization (`require_auth`).
2. Update balances (using internal helper functions).
3. Publish a transfer event (**Transfer event**).

```rust
pub fn transfer(e: Env, from: Address, to: Address, amount: i128) {
    // 1. Authorization
    from.require_auth();

    // 2. Logic (Simplified)
    spend_balance(&e, from.clone(), amount);
    receive_balance(&e, to.clone(), amount);

    // 3. Event
    events::Transfer { from, to, amount }.publish(&e);
}


```

## Events

Soroban token contracts emit standard events to allow external systems to track activity.

Common events include:

* `Transfer`
* `Mint`
* `Burn`
* `Approve`

## Initialization Pattern

Contracts are typically initialized after **deployment** using a constructor or an `initialize` function. This sets up the **admin** and metadata.

```rust
pub fn initialize(e: Env, admin: Address, decimals: u32, name: String, symbol: String) {
    write_admin(&e, admin);
    write_metadata(&e, decimals, name, symbol);
}


```

## TokenClient

The SDK automatically generates a `TokenClient` struct based on the interface. This allows developers to interact with token contracts from other contracts or within **tests**.

```rust
// Example usage in a test or cross-contract call
let client = TokenClient::new(&env, &contract_id);

// Transparently calls the functions defined in the interface
client.transfer(&from, &to, &100);


```

This client works transparently with both **Stellar Asset Contracts** and **Custom Tokens**.

## Recommended Complete Structure

```rust
#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror,
    Address, Env, String, Symbol, symbol_short
};

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
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        // Initialization
    }
    
    pub fn mint(env: Env, to: Address, amount: i128) -> Result<(), Error> {
        // Mint tokens
    }
    
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) -> Result<(), Error> {
        // Transfer tokens
    }
    
    pub fn balance(env: Env, id: Address) -> i128 {
        // Query balance
    }
}

```

## Token Best Practices

1. **Use `i128` for balances**: Supports large values and negatives for calculations.
2. **Validate `amount > 0**`: Prevents invalid transfers.
3. **Extend TTL on reads**: Keep balances active.
4. **Emit events**: Facilitates indexing and tracking.
5. **Implement `initialize` once**: Prevents re-initialization.

## Related References

* **[SDK Types](sdk_types.md)**: Using `i128` for balances, `Address`, `String`
* **[SDK Storage](sdk_storage.md)**: Persistent Storage for balances, Instance for metadata
* **[SDK Auth](sdk_auth.md)**: `require_auth()` in transfers and mint
* **[SDK Errors](sdk_errors.md)**: Token error definition and handling
* **[SDK Env](sdk_env.md)**: Event emission and storage access
* **[Example Counter](examples_counter.md)**: Simpler example to understand fundamentals
* **[CLI Basics](cli_basic.md)**: Deploy and invoke the token contract
Here is the English translation of the document, optimized for your RAG system. I have translated the explanations and the code comments to ensure the model understands the context fully in English.

---

```markdown
# Antipatterns in Soroban Token Contracts (Common Pitfalls Guide)

meta-description: Critical list of errors, unsafe practices, and inefficient code that must be AVOIDED when developing tokens on Soroban. Use this to fix code or audit implementations.
tags: antipattern, security, errors, debugging, ttl, auth, gas-optimization

This document describes common incorrect patterns and provides their canonical solution ("Refactoring").

## 1. The "Self-Client" Antipattern (Unnecessary Recursion)
**The Error:** Using `token::Client` within the contract itself to read or modify its own state.
**Why it's bad:** It incurs unnecessary gas costs due to client instantiation and cross-contract calls to itself. It can cause loops or logic errors if the environment does not expect a reentrant call (although Soroban prevents reentrancy, this is conceptually incorrect).



### ❌ Incorrect Code (BAD)
```rust
fn name(e: Env) -> String {
    // ERROR: The contract calls itself as if it were an external user
    let client = token::Client::new(&e, &e.current_contract_address());
    client.name() 
}

fn transfer(e: Env, from: Address, to: Address, amount: i128) {
    // ERROR: Calling transfer on itself
    token::Client::new(&e, &e.current_contract_address()).transfer(&from, &to, &amount);
}

```

### ✅ Correct Solution (GOOD)

Access `Storage` directly using the defined data keys.

```rust
fn name(e: Env) -> String {
    // Correct: Read directly from instance memory
    e.storage().instance().get(&DataKey::Name).unwrap()
}

fn transfer(e: Env, from: Address, to: Address, amount: i128) {
    // Correct: Call internal balance logic functions
    from.require_auth();
    balance::spend_balance(&e, from, amount);
    balance::receive_balance(&e, to, amount);
    events::transfer(&e, from, to, amount);
}

```

---

## 2. The "Zombie Storage" Antipattern (Ignoring TTL)

**The Error:** Writing data to `Persistent` or `Temporary` storage without extending its Time To Live (`extend_ttl`).
**Why it's bad:** In Soroban, storage pays rent. If you do not extend the TTL, data (user balances) will expire and be archived (or deleted in the case of Temporary), causing the contract to fail or users to lose access to their funds until restored (which is costly).

### ❌ Incorrect Code (BAD)

```rust
fn mint(e: Env, to: Address, amount: i128) {
    let key = DataKey::Balance(to.clone());
    let current_balance = e.storage().persistent().get(&key).unwrap_or(0);
    // ERROR: Data is saved, but its TTL might be about to expire
    e.storage().persistent().set(&key, &(current_balance + amount));
}

```

### ✅ Correct Solution (GOOD)

Always apply `extend_ttl` when reading or writing critical data.

```rust
const BALANCE_LIFETIME: u32 = 17280 * 30; // ~30 days
const BALANCE_THRESHOLD: u32 = 17280;      // ~1 day

fn mint(e: Env, to: Address, amount: i128) {
    let key = DataKey::Balance(to.clone());
    let current_balance = e.storage().persistent().get(&key).unwrap_or(0);
    
    e.storage().persistent().set(&key, &(current_balance + amount));
    
    // Correct: Ensure data survives for at least 30 more days
    e.storage().persistent().extend_ttl(&key, BALANCE_THRESHOLD, BALANCE_LIFETIME);
}

```

---

## 3. The "Fake Auth" Antipattern (Manual Verification)

**The Error:** Attempting to verify identity by comparing addresses manually or passing signatures as arguments, instead of using `require_auth`.
**Why it's bad:** It is insecure. `require_auth` is the only way the Soroban host cryptographically verifies that the transaction was signed by the owner of the `Address`.

### ❌ Incorrect Code (BAD)

```rust
fn transfer(e: Env, sender: Address, to: Address, amount: i128) {
    // ERROR: This does not prevent anyone from calling the function with another's address
    if sender == to { panic!("cannot send to self"); }
    // Missing require_auth()!
    
    spend_balance(&e, sender, amount); // IMMINENT FUND THEFT
}

```

### ✅ Correct Solution (GOOD)

```rust
fn transfer(e: Env, sender: Address, to: Address, amount: i128) {
    // Correct: This halts execution if the tx is not signed by 'sender'
    sender.require_auth(); 
    
    spend_balance(&e, sender, amount);
}

```

---

## 4. The "Panic Everywhere" Antipattern

**The Error:** Using `panic!` to validate business logic (e.g., "insufficient balance").
**Why it's bad:**

1. It makes testing difficult (the test crashes instead of asserting an error).
2. Clients (Frontends) receive a generic `HostError` instead of knowing what happened.
3. It is not idiomatic in Rust.

### ❌ Incorrect Code (BAD)

```rust
fn transfer(e: Env, amount: i128) {
    if amount < 0 {
        panic!("amount cannot be negative"); // Hard to debug for the client
    }
}

```

### ✅ Correct Solution (GOOD)

Define an Error Enum and return `Result`.

```rust
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum TokenError {
    NegativeAmount = 1,
    InsufficientBalance = 2,
}

fn transfer(e: Env, amount: i128) -> Result<(), TokenError> {
    if amount < 0 {
        return Err(TokenError::NegativeAmount); // Client receives error code 1
    }
    Ok(())
}

```

---

## 5. The "Open Initialization" Antipattern (Front-Running)

**The Error:** Not protecting the `initialize` function or checking if it was already initialized.
**Why it's bad:** An attacker can observe your deployment and call `initialize` with their own address as admin before you do, hijacking the contract.

### ❌ Incorrect Code (BAD)

```rust
pub fn initialize(e: Env, admin: Address) {
    // ERROR: If I call this a second time, I overwrite the admin
    e.storage().instance().set(&DataKey::Admin, &admin);
}

```

### ✅ Correct Solution (GOOD)

```rust
pub fn initialize(e: Env, admin: Address) {
    // 1. Verify if it already exists
    if e.storage().instance().has(&DataKey::Admin) {
        panic!("already initialized");
    }
    // 2. Write state
    e.storage().instance().set(&DataKey::Admin, &admin);
}

```

## 6. The "Heavy Calculation Before Auth" Antipattern (Gas Griefing)

**The Error:** Executing expensive logic before calling `require_auth`.
**Why it's bad:** Although failed transactions pay fees in Soroban, it is bad practice to consume network resources if authorization is going to fail anyway. Always `Fail Fast`.

### ❌ Incorrect Code (BAD)

```rust
fn complicated_op(e: Env, user: Address) {
    // ... 50 lines of complex mathematical calculations ...
    // ... For loops ...
    
    user.require_auth(); // If this fails, we wasted compute
}

```

### ✅ Correct Solution (GOOD)

```rust
fn complicated_op(e: Env, user: Address) {
    user.require_auth(); // Validate first
    
    // ... 50 lines of complex mathematical calculations ...
}

```

---

## References and Related Documents

To correctly implement the patterns described in this document, consult:

### Token Contract Fundamentals

* **[examples_token_contract](https://www.google.com/search?q=examples_token_contract.md)** - Complete and correct implementation of a SEP-41 token contract
* **[examples_token](https://www.google.com/search?q=examples_token.md)** - Step-by-step guide to creating tokens in Soroban

### Storage and TTL

* **[sdk_storage](sdk_storage.md)** - Complete documentation on storage types (Instance, Persistent, Temporary) and TTL management
* **[sdk_env](sdk_env.md)** - Reference for the `Env` object and its storage methods

### Authentication and Security

* **[sdk_auth](sdk_auth.md)** - Detailed guide on `require_auth()`, `require_auth_for_args()`, and signature verification

### Error Handling

* **[sdk_errors](sdk_errors.md)** - How to define and use `#[contracterror]` correctly instead of `panic!`

### Data Types

* **[sdk_types](sdk_types.md)** - Native Soroban types: Address, String, Map, Vec, and their methods

### General Concepts

* **[overview](overview.md)** - Introduction to Soroban and general architecture
* **[examples_counter](examples_counter.md)** - Basic example to understand contract structure

### CLI Tools

* **[cli_basic](cli_basic.md)** - Commands to compile, depl
# Authorization (Auth) in Soroban SDK

## Overview

The `src/auth.rs` module defines the fundamental types and data structures used by the **Soroban Authorization Framework**. Unlike `env.rs`, which contains execution *logic*, `auth.rs` contains the *definitions* that describe **what** is being authorized.

This module is crucial for understanding how contracts verify the identity of callers (invokers) and how cross-contract calls are authorized on behalf of the current contract.

## Core Types

### 1. `Context` (Enum)

The `Context` enum describes the specific context in which authorization is required. It identifies what action the signer is attempting to perform.

* **`Contract(ContractContext)`**: Indicates that authorization is for the invocation of a smart contract function. This is the most common case (e.g., a user calling `transfer` on a token contract).
* **`CreateContractHostFn(CreateContractHostFnContext)`**: Indicates authorization for the creation of a new contract via the host function (without a constructor).
* **`CreateContractWithCtorHostFn(...)`**: Indicates authorization to create a contract that includes constructor arguments.

### 2. `ContractContext` (Struct)

This structure details the specific parameters of a contract invocation that requires authorization. It is the "payload" that the user signs implicitly or explicitly.

* **`contract`**: The address (`Address`) of the contract being invoked.
* **`fn_name`**: The function name (`Symbol`) to be executed.
* **`args`**: The list of arguments (`Vec<Val>`) passed to the function.

This structure ensures that the authorization is linked to a specific execution and cannot be reused to call other functions or contracts (prevention of replay and destination confusion).

### 3. `InvokerContractAuthEntry`

This structure is used when a contract acts as an intermediary and needs to authorize calls to sub-contracts on its own behalf or on behalf of the user (if `authorize_as_current_contract` is used).

It represents an entry in the authorization tree that the current contract presents to the Host to justify the subsequent calls it will make.

## Authorization Flow in the SDK

Although the types are defined in `auth.rs`, their primary usage occurs through `Env` methods and the `Address` type:

1. **Verification (`require_auth`)**:
When `address.require_auth()` is called, the Host constructs a `Context::Contract` with the current call data and verifies if that address has signed that specific context.
2. **Sub-call Authorization**:
The `env.authorize_as_current_contract(auth_entries)` method uses `InvokerContractAuthEntry` to allow the current contract to make calls to other contracts requiring authorization, inserting these entries into the authorized invocation tree.

## Relation with Testutils

In the testing environment (`testutils`), these types are fundamental for simulating authorizations using `MockAuth`. When creating a `MockAuth`, `ContractContext` instances are built to define which specific calls should be simulated as "approved" without needing actual cryptographic signatures.

## Related Macros

These types are usually decorated with `#[contracttype]`, allowing them to be efficiently serialized and deserialized to interact with the Soroban Host and be represented in XDR (Stellar's data encoding layer).

## Common Authorization Patterns

### Pattern 1: Simple Authorization

```rust
pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
    from.require_auth();  // The 'from' must authorize
    // ... transfer logic
}

```

### Pattern 2: Admin Validation

```rust
pub fn admin_action(env: Env, admin: Address) -> Result<(), Error> {
    admin.require_auth();
    
    let stored_admin: Address = env.storage()
        .instance()
        .get(&symbol_short!("admin"))
        .ok_or(Error::NotInitialized)?;
    
    if admin != stored_admin {
        return Err(Error::Unauthorized);
    }
    
    Ok(())
}

```

### Pattern 3: Authorization with Specific Arguments

```rust
pub fn approve(env: Env, from: Address, spender: Address, amount: i128) {
    // Specifically authorizes these arguments
    from.require_auth_for_args((spender.clone(), amount).into_val(&env));
}

```

## Related References

* **[SDK Errors](sdk_errors.md)**: Handling authorization errors (Error::Unauthorized)
* **[SDK Types](sdk_types.md)**: `Address` type and its methods
* **[SDK Env](sdk_env.md)**: Execution context for authorization
* **[Example Token](examples_token.md)**: Real usage of `require_auth()` in transfers
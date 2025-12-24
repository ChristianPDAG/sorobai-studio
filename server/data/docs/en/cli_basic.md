# Stellar CLI Basics

The **Stellar CLI** is the official command-line tool for interacting with the Stellar network and developing smart contracts on Soroban. It allows you to compile contracts, deploy them to the network (**Deploy**), invoke functions (**Invoke**), and manage identities (**Keys**).

## Installation

The most common way to install the CLI is via **Cargo** (the Rust package manager) or **Homebrew** (on macOS).

```bash
# Install with Cargo (Recommended for Rust devs)
cargo install --locked stellar-cli

# Install on macOS/Linux with brew
brew install stellar-cli


```

> **Note:** The main command is `stellar`. In previous versions `soroban` was used, but now everything is unified under `stellar` (e.g., `stellar contract deploy`).

## Identity Management (Identity & Keys)

To interact with the network, you need an identity (public/private key pair). The CLI allows you to manage these identities securely without constantly handling private keys in plain text.

### Generate an identity

Create a new identity named "alice" and save its keys in the local secure system.

```bash
stellar keys generate alice --network testnet


```

* **`--network testnet`**: Automatically funds the account using Friendbot if the test network is specified.

### List identities

To view the stored public addresses:

```bash
stellar keys address alice


```

## Network Configuration

The CLI needs to know which network to connect to (Local, Testnet, Mainnet).

* **Testnet:** Public test network.
* **Local:** Private network using `stellar-quickstart` in Docker.

### Configure Default Network

You can define an environment variable or use flags in each command. The common practice is to use `--network`.

```bash
# Example usage with explicit flag
stellar contract invoke --network testnet ...


```

## Contract Lifecycle

The standard workflow for a Soroban developer includes: **Build** → **Deploy** → **Invoke**.

### 1. Build

Compiles the Rust contract to WebAssembly (`.wasm`). The CLI wraps `cargo build` to optimize the result.

```bash
stellar contract build


```

This generates the `.wasm` file in `target/wasm32-unknown-unknown/release/`.

### 2. Deploy

Uploads the compiled code to the network and creates an instance of the contract.

```bash
stellar contract deploy \
    --wasm target/wasm32-unknown-unknown/release/my_contract.wasm \
    --source alice \
    --network testnet


```

* **Output:** Returns the **Contract ID** (e.g., `C123...`) that you will use to interact with it.

### 3. Invoke

Executes a public function of the smart contract.

```bash
stellar contract invoke \
    --id C123... \
    --source alice \
    --network testnet \
    -- \
    hello \
    --to bob


```

* **`--id`**: The contract ID obtained in the deploy step.
* **`--`**: Important separator. Everything that follows are the **function arguments** of the contract (`fn name` and its parameters).

## Additional Utilities

### Binding Generation

The CLI can automatically generate client libraries (SDKs) for TypeScript, Python, or Rust based on your contract.

```bash
stellar contract bindings typescript \
    --wasm my_contract.wasm \
    --output-dir ./npm-package


```

### Optimization (Optimize)

For production, it is crucial to reduce the size of the `.wasm` binary to minimize storage and execution costs.

```bash
stellar contract build --optimize


```

## Related References

* **[Overview](overview.md)**: Introduction to Soroban and general architecture
* **[SDK Types](sdk_types.md)**: Data types to pass as arguments in `invoke`
* **[SDK Errors](sdk_errors.md)**: How to handle errors during deploy/invoke
* **[Example Counter](examples_counter.md)**: Complete flow: build → deploy → invoke
* **[Example Token](examples_token.md)**: Real-world token deployment case
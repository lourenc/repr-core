# DECENTRALIZED AI MULTISIGNATURE

## Installation

Prerequisites: `NodeJS` version 16 or higher, `npm` version 7 or higher.

📝 _`NodeJS` version **`v20.9.0`** (LTS) and `npm` version **`10.1.0`** were used for development_.

Run the command `$ npm install` in [the root of the project directory](./) to install all the dependencies specified in [`package.json`](./package.json), compile contracts ([`contracts/`](./contracts/)), prepare an ABI ([`abi/`](./abi/)), documentation ([`docs/`](./docs/)) for the contracts in [the NatSpec format](https://docs.soliditylang.org/en/latest/natspec-format.html) and [Husky hooks](#husky-hooks).

## Environment setup

Before running scripts for deployment or making snapshots it is important to set up all keys. In file [`.env.example`](./.env.example) there are all variables that must be copy and set in file [`.env`].

### CAST VOTE SETTINGS

-   `SPACE` - the name of the space on [`snapshot.org`](https://snapshot.org/#/)
-   `REASON` - the reason of made decision
-   `CHOICE` - number of the choice
-   `PROPOSAL` - the address of proposal

### Global setting

-   `ETHERSCAN_API_KEY` & `POLYGONSCAN_API_KEY` - are required for verifying source code of the contracts on explorers. They can be obtained on explorers, in account.

-   `SEPOLIA_URL` - Required for making transactions on chain. Sepolia is testnet of the Ethereum mainnet. URL can be obtained at [`Get Block`](https://getblock.io/)
-   `POLYGON_URL` - Required for making transactions on chain. Mainnet of the Polygon. URL can be obtained at [`Get Block`](https://getblock.io/)

-   `ETHEREUM_TESTNET_KEYS` and `POLYGON_MAINNET_KEYS` - Required for making transaction from the wallet. Thus, each contract that will be deployed from the first wallet. It is also available to use one key, even one key for all chains.

-   `ERC20_RECEIVER_ADDRESS=0xADDRESS` - Address is using as a receiver of minting token by calling `mintTokens` script.

# SoulBoundToken (SBT) Deployment Script

## Prerequisites

-   **Hardhat Project:** This script is designed to run within a Hardhat project environment.
-   **SoulBoundToken Contract:** Ensure you have a `SoulBoundToken.sol` contract file available in your project.
-   **Verification Helper:** The script uses a `verify` helper function (assumed to be defined in a `helpers.js` file) to handle contract verification on Etherscan. This function would typically require your Etherscan API key to be set up.

## Functionality

1. **Deployer Retrieval:** The script retrieves the deployer's account from the available signers using `ethers.getSigners()`.
2. **SBT Deployment:** It deploys the `SoulBoundToken` contract using the deployer's account.
3. **SBT Verification (Optional):** If the script is not running on a local network (Hardhat or localhost), it attempts to verify the deployed SBT contract on Etherscan using the `verify` helper function.

## Usage

**Run the Script:** Execute the script using `npx hardhat run scripts/deploySBT.ts --network sepolia` (or use `--network polygon` in case if you run script for polygon mainnet).
Use `./scripts/deploySBT.sh` for integration (equivalent to the deployment to Polygon).

## Example Output

```
Deploying SBT...
Verifying contract...

`SBT` is deployed to 0xYOUR_DEPLOYED_SBT_CONTRACT_ADDRESS
```

### 🟥After deployment update address of SBT in [`Addresses`](./scripts/deploymentAddressses.json) based on network you running🟥

# Soulbound Token (SBT) Minting Script

This Hardhat script mints a new Soulbound Token (SBT) NFT within an already deployed SBT contract. The minted NFT is associated with both the multisig owner (deployer) and the specified recipient.

## Prerequisites

-   **Hardhat Project:** This script is designed to run within a Hardhat project environment.
-   **Deployment Addresses:** You'll need a JSON file (`deploymentAddressses.json`) containing the address of:
    -   The deployed SoulBoundToken contract (`sbt`)

## Configuration

1. **Deployment Addresses:** Update the `deploymentAddressses.json` file with the correct address of your deployed SoulBoundToken contract, AI Account Address and Multisig Owner under the `sepolia` or `polygon` network section. The file structure should look like this:

```json
{
    "sepolia": {
        "sbt": "0xYOUR_DEPLOYED_SBT_CONTRACT_ADDRESS",
        "aiAccountAddress": "0xYOUR_AI_ACCOUNT_ADDRESS",
        "multisigOwner": "0xYOUR_USER_ADDRESS"
        // ... other addresses ...
    }
}
```

## Usage

**Run the Script:** Execute the script using `npx hardhat run scripts/mintSbtToken.ts --network sepolia` (or use `--network polygon` in case if you run script for polygon mainnet).

## Functionality

1. **Signer Retrieval:** The script retrieves the deployer's account (assumed to be the multisig owner) from the available signers using `ethers.getSigners()`.
2. **SBT Contract Loading:** It loads the deployed `SoulBoundToken` contract using its address from the `deploymentAddressses.json` file.
3. **NFT Minting:** It calls the `mint` function of the SBT contract with the `multisigOwner` (deployer's address) and `recipient` (also the deployer's address in this example).
    - It first performs a `staticCall` to estimate the token ID that would be minted.
    - Then, it executes the actual `mint` transaction and waits for one block confirmation.
4. **Output:** The script logs the minted NFT's token ID to the console.

# ERC6551 Account Deployment Script

## Functionality

**Deployment of ERC6551Account:** Deploys a new ERC6551 account contract.
**Verification of ERC6551Account:** Verifies the deployed ERC6551 account contract on supported networks.
**Interaction with Registry:** Interacts with the ERC6551 registry contract to create an account associated with the deployed ERC6551 implementation, SBT, and the minted NFT.
**Retrieval of ERC6551 Proxy:** Fetches the proxy contract address of the created ERC6551 account.

## Usage

1. **Install Dependencies:** Ensure all required dependencies are installed (`npm install`).
2. **Compile Contracts:** Compile your contracts using `npx hardhat compile`.
3. **Run the Script:** Execute the script using:
   for the Sepolia Testnet:
    ```bash
     npx hardhat run scripts/deployERC6551Account.ts --network sepolia
    ```
    For the Polygon Mainnet
    ```bash
     npx hardhat run scripts/deployERC6551Account.ts --network polygon
    ```

## After deployment

Manually update the addresses in [`deploymentAddresses`](./scripts/deploymentAddressses.json) based on network you are running.

## Key Points

-   **Verification:** The script attempts to verify contracts on supported networks using the Hardhat verify plugin.
-   **Error Handling:** The script includes basic error handling to log errors and exit with a non-zero status code.
-   **Sleep Function:** A `sleep` function is used to introduce delays before verification, accommodating potential network latency.

# Gnosis Safe Multisig Wallet Deployment Script

This Hardhat script deploys a Gnosis Safe multisig wallet using the Gnosis Safe Proxy Factory. It sets up the wallet with specific owners, a threshold for transaction confirmation, and other relevant parameters.

## Prerequisites

-   **Deployment Addresses:** You'll need a JSON file (`deploymentAddresses.json`) containing the addresses of any relevant deployed contracts (e.g., the ERC6551Account Proxy in this case).
-   **Environment Variables:** The script uses environment variables (`.env`) to load the address of the second signer (ERC6551Account Proxy).

## Configuration

1. **Deployment Addresses:** Update the `deploymentAddresses.json` file with the correct addresses of your deployed contracts (particularly the ERC6551Account Proxy).
2. **CHAIN EDITING** Update from which chain you taking address of the ERC6551 Proxy.
   Example:

`const SECOND_SIGNER = addrs.sepolia.erc6551AccountProxy;`

`const SECOND_SIGNER = addrs.polygon.erc6551AccountProxy;`

## Usage

1. **Install Dependencies:** Ensure all required dependencies are installed (`npm install`).
2. **Compile Contracts (if applicable):** If you haven't already compiled the Gnosis Safe contracts and generated the ABI file, compile them using the appropriate command in your Hardhat project (e.g., `npx hardhat compile`).
3. **Run the Script:** Execute the script using:
   for the Sepolia Testnet:
    ```bash
     npx hardhat run scripts/deployMultisigWallet.ts --network sepolia
    ```
    For the Polygon Mainnet:
    ```bash
     npx hardhat run scripts/deployMultisigWallet.ts --network polygon
    ```

# AiSigToken Minting Script

This Hardhat script mints a specified amount of `AiSigToken` tokens and transfers them to a designated receiver address.

## Prerequisites

-   **Hardhat Project:** This script is designed to operate within a Hardhat project environment.
-   **AiSigToken Contract:** Make sure you have an `AiSigToken.sol` contract already deployed to the network.
-   **Deployment Addresses File:** You need a JSON file named [`deploymentAddressses.json`](./scripts/deploymentAddressses.json) in your project directory containing the address of your deployed `AiSigToken` contract under the "sepolia" network section.
-   **Environment Variables:** The script uses an environment variable (`ERC20_RECEIVER_ADDRESS`) to fetch the receiver's address. If not set, it defaults to an empty string, which would likely cause an error in the minting process.
-   **Helper Function:** The script assumes the existence of a helper function `addDec` in your project's test helpers. This function is expected to format the token amount for minting.

## Configuration

1. **Environment Variables:** Create a `.env` file in your project's root directory and add the following line:

```
ERC20_RECEIVER_ADDRESS=0xYOUR_RECEIVER_ADDRESS
```

🟥Replace `0xYOUR_RECEIVER_ADDRESS` with the actual address you want to receive the minted tokens (Gnosis Multisig Wallet). So, before minting tokens, make sure you are deployed Multisignature Wallet.🟥

2. **Deployment Addresses:** Ensure that your `deploymentAddressses.json` file contains the correct address for your `AiSigToken` contract under the "sepolia" or "polygon" network section, like this:

```json
{
    "sepolia": {
        "aiSigToken": "0xYOUR_DEPLOYED_AISIGTOKEN_CONTRACT_ADDRESS"
        // ... other addresses
    }
}
```

## Usage

**Run the Script:** Execute the script using `npx hardhat run scripts/mintTokens.ts --network sepolia` (or use `--network polygon` in case if you run script for polygon mainnet).

## Functionality

1. **Load Signer:** The script gets the first available account as the signer (`deployer`) to execute transactions.
2. **Get AiSigToken Contract:** It loads the deployed `AiSigToken` contract instance using its address from the `deploymentAddressses.json` file.
3. **Mint Tokens:**
    - It calls the `mintFor` function on the `AiSigToken` contract to mint the specified amount of tokens (`100_000` in this case, formatted using `addDec`).
    - It waits for one block confirmation to ensure the transaction is mined.
4. **Output:** The script logs messages to the console, indicating the receiver's address and the number of tokens minted.

# Gnosis Safe Multisig Wallet Transaction Execution Script (using ERC6551)

This script enables the execution of a transaction within a Gnosis Safe multisig wallet using an ERC6551 account. The transaction involves casting a vote using the `castVote` function and then executing the encoded vote through the Gnosis Safe.

## Prerequisites

-   **Deployment Addresses:** You'll need a JSON file (`deploymentAddressses.json`) containing the addresses of:
    -   The deployed Gnosis Safe multisig wallet (`gnosisWallet`)
    -   The deployed ERC6551 account proxy (`erc6551AccountProxy`)
-   **castVote function:** The script expects a `castVote` function to be defined in your project. This function should return the hash of the vote.

## Configuration

1. **Deployment Addresses:** Update the `deploymentAddresses.json` file with the correct addresses of your deployed Gnosis Safe multisig wallet and ERC6551 account proxy.
2. **CHAIN EDITING** Update from which chain you taking address of the ERC6551 Proxy and GNOSIS Wallet.
   Example:

`const GNOSIS_WALLET = addrs.sepolia.gnosisWallet;`

`const ERC6551_ACCOUNT_PROXY = addrs.sepolia.erc6551AccountProxy;`

---

`const GNOSIS_WALLET = addrs.polygon.gnosisWallet;`

`const ERC6551_ACCOUNT_PROXY = addrs.polygon.erc6551AccountProxy;`

---

## Usage

1. **Install Dependencies:** Ensure all required dependencies are installed (`npm install`).
2. **Compile Contracts:** Compile your contracts (including Gnosis Safe, SignMessageLib, and your custom contracts) using the appropriate command in your Hardhat project (e.g., `npx hardhat compile`).
3. **Run the Script:** Execute the script using:
   for the Sepolia Testnet:
    ```bash
     npx hardhat run scripts/execTransaction.ts --network sepolia
    ```
    For the Polygon Mainnet:
    ```bash
     npx hardhat run scripts/execTransaction.ts --network polygon
    ```

# Snapshot Voting Script (castVote)

This script prepares data for casting a vote in the Snapshot voting system. It generates a typed data hash based on the specified parameters (space, proposal, choice, reason, etc.) that can be used to sign and cast the vote.

## Prerequisites

-   **Environment Variables:** The script uses environment variables (`.env`) to load the values for:
    -   `SPACE`: The Snapshot space where the vote is taking place.
    -   `PROPOSAL`: The proposal identifier (bytes32) for which the vote is being cast.
    -   `CHOICE`: The selected choice for the vote (uint32).
    -   `REASON`: The reason for the vote (string).
-   **Deployment Addresses:** You'll need a JSON file (`deploymentAddressses.json`) containing the address of:
    -   The Gnosis Safe multisig wallet (`gnosisWallet`) used for casting the vote.

## Configuration

1. **Environment Variables:** Create a `.env` file in your project's root directory and add the following lines, replacing the placeholders with the appropriate values:

    ```
    SPACE=your_snapshot_space
    PROPOSAL=0xYOUR_PROPOSAL_ID_BYTES32
    CHOICE=YOUR_CHOICE_NUMBER
    REASON="Your reason for voting"
    ```

2. **Deployment Addresses:** Update the `deploymentAddressses.json` file with the correct address of your deployed Gnosis Safe multisig wallet.

## Usage

**Script use**: Script is using in execTransaction script.

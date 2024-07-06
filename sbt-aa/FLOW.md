## Prerequisites

SBT and AI Multisig ERC20 token are deployed in advance.
* Fill the following variables in `.env`:
    - POLYGON_URL -- RPC URL for Polygon
    - POLYGON_MAINNET_KEYS -- Private key of the protocol account (For the convinience, protocol key can both represent Protocol and AI Accounts (meaning that they have same public address)). Otherwise, you will have to switch private key in the step 5 (See step 5 for details).
    - POLYGONSCAN_API_KEY -- API KEY of Polygonscan necessary for validation of Smart contracts (You can use "KZDQPQCIY3VJX5ZUHUN2IEX5SP2TWRHZ5T" or create your own). 

### 1) Mint NFT to AI address.
## Prerequisites
* Setup AI Address.
- fill `aiAccountAddress` in `deploymentAddressses.json` for polygon config with the public address of the AI Account. This address will be receiver of the NFT.
- fill `multisigOwner` in `deploymentAddressses.json` for polygon config with the public address of theUser. This address is the address of the user.

Run ```./scripts/mintSbtToken.sh```
The ID of minted NFT will be displayed in the CLI.

**NOTE!** fill `tokenId` in `deploymentAddressses.json` for polygon config with the ID of minted NFT.

### 2) Deploy ERC6551Account.
## Prerequisites
* Make sure that you filled `tokenId` in `deploymentAddressses.json` for polygon config as described in previous step.
Run ```./scripts/deployERC6551Account.sh```

**NOTE!** fill `erc6551Account` and `erc6551AccountProxy` in `deploymentAddressses.json` for polygon config with `ERC6551Account` and `ERC6551Account Proxy` displayed in CLI.

### 3) Deploy Gnosis Multisig Wallet.
## Prerequisites
* Make sure that you filled `erc6551Account`,`erc6551AccountProxy` and `multisigOwner` in `deploymentAddressses.json` for polygon config as described in previous steps.
Run ```./scripts/deployMultisigWallet.sh```

**NOTE!** fill `gnosisWallet` in `deploymentAddressses.json` for polygon config with `Wallet address` displayed in CLI.

### 4) Mint AiSig ERC20 tokens.
## Prerequisites
* Make sure that you filled `gnosisWallet` in `deploymentAddressses.json` for polygon config as described in previous steps.
**Note!** This script will mint 100_000 tokens to the `gnosisWallet`.
Run ```./scripts/mintTokens.sh```

### 5) Voting in proposal.
## Prerequisities
* The space and 3 test proposals are already created at snapshot.org: https://snapshot.org/#/testoneth.eth
* Fill in or make sure that the following parameters in `deploymentAddressses.json` for polygon config:
    - space -- The name of the space. 
    - proposal -- Hash of the proposal. Can be obtained from Snapshot API.
    - choice -- the id of choice. Ids of choice start from 1, 2, 3, etc...
    - reason -- optional parameter to describe reason of your vote. Leave as empty string if you don't want to fill in the reason.
    - timestamp -- timestamp of signature of the proposal, sent in UI. Put current timestamp if you initiate signature first time, without UI.

**Attention!** Do not forget to change the private key `POLYGON_MAINNET_KEYS` in .env with the private key of AI Account.

Run ```./scripts/execTransaction.sh```

### 5b) Approve existing voting.
## Prerequisites
* Initiate voting in Global Safe Wallet from first account.
* Fill in `safeTxHash` in `deploymentAddressses.json` for polygon config. You can obtain the hash in the transaction which will be located in Gnosis Safe Queue.
Run ```./scripts/approveExecTx.sh```
## Postrequsities
* Send transaction from Global Safe Queue

### Set Delegate
## Preprequisities
* make sure to add strategy `delegation` in strategies in snapshot.
* Fil in `delegateAddress` in `deploymentAddressses.json` for polygon config. This address will become a delegate.
Run ```./scripts/setDelegate.sh```
## Postrequsities
* Log in to the snapshot to vote as a delegate.

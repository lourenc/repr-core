#!/bin/bash

# Set error handle modes.
set -o errexit
set -o nounset
set -o pipefail

NETWORK="polygon"

npx hardhat run scripts/approveExecTx.ts --network $NETWORK
import hre from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

import { ethers } from "hardhat";
import { Wallet } from '@ethersproject/wallet';
import { JsonRpcProvider, Provider, Web3Provider, getDefaultProvider, ExternalProvider, InfuraProvider } from '@ethersproject/providers';

import snapshot from '@snapshot-labs/snapshot.js';
import { Lock } from '@snapshot-labs/lock';
import injected from '@snapshot-labs/lock/connectors/injected';
import walletconnect from '@snapshot-labs/lock/connectors/walletconnect';

import addrs from "./deploymentAddressses.json";

import gnosisSafeL2 from "../artifacts/contracts/interfaces/IGnosisSafeL2.sol/IGnosisSafeL2.json";
import signMessageLib from "../artifacts/contracts/interfaces/ISignMessageLib.sol/ISignMessageLib.json";

import { castVote } from "./castVote";


let GNOSIS_WALLET: string, ERC6551_ACCOUNT_PROXY: string, TX_HASH: string;

if (hre.network.name === "sepolia") {
    GNOSIS_WALLET = addrs.sepolia.gnosisWallet;
    ERC6551_ACCOUNT_PROXY = addrs.sepolia.erc6551AccountProxy;
    TX_HASH = addrs.sepolia.safeTxHash;
} else if (hre.network.name === "polygon") {
    GNOSIS_WALLET = addrs.polygon.gnosisWallet;
    ERC6551_ACCOUNT_PROXY = addrs.polygon.erc6551AccountProxy;
    TX_HASH = addrs.polygon.safeTxHash;
} 

async function execTransaction() {
    // Get signer
    const [deployer] = await ethers.getSigners();

    // Get gnosis wallet
    const gnosisWallet = await ethers.getContractAt("IGnosisSafeL2", GNOSIS_WALLET, deployer);

    // erc6551 account
    const erc6551AccountProxy = await ethers.getContractAt("ERC6551Account", ERC6551_ACCOUNT_PROXY, deployer);

    console.log(`Encoding hash with message signing...`);

    const IGnosisSafeL2 = new ethers.Interface(gnosisSafeL2.abi);

    const encodedData = IGnosisSafeL2.encodeFunctionData("approveHash", [TX_HASH]);

    // Execute from erc6551 account
    console.log("Sending tx");
    const txExecute = await erc6551AccountProxy.execute(gnosisWallet.target, 0, encodedData, 0);
    console.log("Waiting for tx submitting");
    await txExecute.wait(1);

    console.log(`\nHash of successful transaction: ${txExecute.hash}`);

    console.log(`\nDone!`);
}

execTransaction()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

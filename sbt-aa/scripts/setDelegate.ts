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
import delegateRegistry from "../artifacts/contracts/interfaces/IDelegateRegistry.sol/IDelegateRegistry.json";

import { castVote } from "./castVote";


let SPACE: string, GNOSIS_WALLET: string, ERC6551_ACCOUNT_PROXY: string, DELEGATE_ADDRESS: string;
let delegateRegistryAddress: string;

if (hre.network.name === "sepolia") {
    GNOSIS_WALLET = addrs.sepolia.gnosisWallet;
    ERC6551_ACCOUNT_PROXY = addrs.sepolia.erc6551AccountProxy;
    SPACE = addrs.sepolia.space;
    DELEGATE_ADDRESS = addrs.sepolia.delegateAddress;

    delegateRegistryAddress = "";
} else if (hre.network.name === "polygon") {
    GNOSIS_WALLET = addrs.polygon.gnosisWallet;
    ERC6551_ACCOUNT_PROXY = addrs.polygon.erc6551AccountProxy;
    SPACE = addrs.polygon.space;
    DELEGATE_ADDRESS = addrs.polygon.delegateAddress;

    delegateRegistryAddress = "0x469788fE6E9E9681C6ebF3bF78e7Fd26Fc015446";
} 

async function execTransaction() {
    // Get signer
    const [deployer] = await ethers.getSigners();

    // Get gnosis wallet
    const gnosisWallet = await ethers.getContractAt("IGnosisSafeL2", GNOSIS_WALLET, deployer);

    // erc6551 account
    const erc6551AccountProxy = await ethers.getContractAt("ERC6551Account", ERC6551_ACCOUNT_PROXY, deployer);

    console.log(`Encoding hash with message signing...`);

    const IDelegateRegistry = new ethers.Interface(delegateRegistry.abi);

    const spaceBytes = ethers.encodeBytes32String(SPACE);
    console.log("spaceBytes: ", spaceBytes)

    const signData = `0x000000000000000000000000${ERC6551_ACCOUNT_PROXY.slice(
        2
    )}000000000000000000000000000000000000000000000000000000000000000001`;

    const data = IDelegateRegistry.encodeFunctionData("setDelegate", [spaceBytes, DELEGATE_ADDRESS]);
    const to = delegateRegistryAddress;
    const value = 0;
    const operation = 0;
    const safeGas = 0;
    const baseGas = 0;
    const gasPrice = 0;
    const gasToken = ethers.ZeroAddress;
    const refundReceiver = ethers.ZeroAddress;
    const signatures = signData;

    const IGnosisSafeL2 = new ethers.Interface(gnosisSafeL2.abi);
    const encodedData = IGnosisSafeL2.encodeFunctionData("execTransaction", [
        to,
        value,
        data,
        operation,
        safeGas,
        baseGas,
        gasPrice,
        gasToken,
        refundReceiver,
        signatures
    ]);

    console.log(data);
    console.log(encodedData);
    // Execute from erc6551 account
    const txExecute = await erc6551AccountProxy.execute(gnosisWallet.target, 0, encodedData, 0);
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

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


let GNOSIS_WALLET: string, ERC6551_ACCOUNT_PROXY: string;

if (hre.network.name === "sepolia") {
    GNOSIS_WALLET = addrs.sepolia.gnosisWallet;
    ERC6551_ACCOUNT_PROXY = addrs.sepolia.erc6551AccountProxy;
} else if (hre.network.name === "polygon") {
    GNOSIS_WALLET = addrs.polygon.gnosisWallet;
    ERC6551_ACCOUNT_PROXY = addrs.polygon.erc6551AccountProxy;
} 

async function execTransaction() {
    // Get signer
    const [deployer] = await ethers.getSigners();

    // Get gnosis wallet
    const gnosisWallet = await ethers.getContractAt("IGnosisSafeL2", GNOSIS_WALLET, deployer);

    // erc6551 account
    const erc6551AccountProxy = await ethers.getContractAt("ERC6551Account", ERC6551_ACCOUNT_PROXY, deployer);

    console.log(`Encoding hash with message signing...`);

    // Data (get from castVote + encode with sign message contract)
    const { hash: hash } = await castVote();
    const ISignMessageLib = new ethers.Interface(signMessageLib.abi);
    const encodedHash = ISignMessageLib.encodeFunctionData("signMessage", [hash]);

    console.log(`\nSigning encoded data...`);

    // Sign encoded data
    const signData = `0x000000000000000000000000${ERC6551_ACCOUNT_PROXY.slice(
        2
    )}000000000000000000000000000000000000000000000000000000000000000001`;

    console.log(`\nPrepare all data for transaction...`);

    // Prepare data for exec transaction
    let to: string;
    if (hre.network.name === "sepolia") {
        to = "0x98FFBBF51bb33A056B08ddf711f289936AafF717";
    } else if (hre.network.name === "polygon") {
        to = "0xA65387F16B013cf2Af4605Ad8aA5ec25a2cbA3a2";
    }
    const value = 0;
    const data = encodedHash;
    const operation = 1;
    const safeGas = 0;
    const baseGas = 0;
    const gasPrice = 0;
    const gasToken = ethers.ZeroAddress;
    const refundReceiver = ethers.ZeroAddress;
    const signatures = signData;

    console.log("EncodedHash: ", encodedHash);

    const IGnosisSafeL2 = new ethers.Interface(gnosisSafeL2.abi);
    console.log("To: ", to);
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

    const encodedData2 = IGnosisSafeL2.encodeFunctionData("approveHash", ["0x09eb0055578371c8cd4c0c9fe777820155290d63b119cd9aa62898574c0ec055"]);

    // Cast a vote
    // const hub = 'https://hub.snapshot.org'; // or https://testnet.hub.snapshot.org for testnet
    // const client = new snapshot.Client712(hub);
    // const tmp = new InfuraProvider("https://polygon-mainnet.infura.io/v3/791561fc2e464295baa1dcbec8ba7090");
    // //const provider = new Web3Provider(tmp)
    // const wallet = new Wallet("0xYourPrivateKey", provider);

    // // Init Lock
    // const lock = new Lock();

    // // Add injected connector
    // lock.addConnector({
    // key: 'injected',
    // connector: injected
    // });

    // // Add WalletConnect connector
    // lock.addConnector({
    // key: 'walletconnect',
    // connector: walletconnect,
    // options: {
    //     infuraId: 'c00cb721...'
    // }
    // });

    // // Log in with injected web3
    // const connector = lock.getConnector('injected');
    // const provider = await connector.connect('injected');

    // const receipt = await client.vote(tmp, "0x11Cb1E53f8695787dDBd3340404b5ca65C9789b5", {
    //     space: 'testoneth.eth',
    //     proposal: '0x85a08e6b114b2fc687448add1b7c5833c5b487a40047ebb4c4daf846582e4695',
    //     type: 'single-choice',
    //     choice: 1,
    //     reason: '',
    //     app: 'snapshot'
    //   });

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

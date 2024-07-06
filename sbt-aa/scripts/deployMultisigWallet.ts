import hre from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

import { ethers } from "hardhat";

import gnosisSafe from "../artifacts/contracts/interfaces/IGnosisSafe.sol/IGnosisSafe.json";

import addrs from "./deploymentAddressses.json";

// Constants
const GNOSIS_FACTORY = "0xC22834581EbC8527d974F8a1c97E1bEA4EF910BC";

// Second signer (ERC6551Account Proxy)
let FIRST_SIGNER: string, SECOND_SIGNER: string;
if (hre.network.name === "sepolia") {
    FIRST_SIGNER = addrs.sepolia.multisigOwner;
    SECOND_SIGNER = addrs.sepolia.erc6551AccountProxy;
} else if (hre.network.name === "polygon") {
    FIRST_SIGNER = addrs.polygon.multisigOwner;
    SECOND_SIGNER = addrs.polygon.erc6551AccountProxy;
}


async function deployMultisigWallet() {
    const [deployer] = await ethers.getSigners();

    const gnosisSafeProxyFactory = await ethers.getContractAt("GnosisSafeProxyFactory", GNOSIS_FACTORY, deployer);

    // Data preparation
    const _singleton = "0xfb1bffC9d739B8D520DaF37dF666da4C687191EA";
    const saltNonce = Math.floor(Math.random() * 100) + 1;

    // Encode data
    const owners = [FIRST_SIGNER, SECOND_SIGNER];
    const threshold = 1;
    const to = ethers.ZeroAddress;
    const data = "0x";
    const fallbackHandler = "0x017062a1dE2FE6b99BE3d9d37841FeD19F573804";
    const paymentToken = ethers.ZeroAddress;
    const payment = 0;
    const paymentReceiver = ethers.ZeroAddress;

    const IGnosisSafe = new ethers.Interface(gnosisSafe.abi);
    const dataBytes = IGnosisSafe.encodeFunctionData("setup", [
        owners,
        threshold,
        to,
        data,
        fallbackHandler,
        paymentToken,
        payment,
        paymentReceiver
    ]);

    const dataBytes2 = IGnosisSafe.approveHash

    console.log("Trying to deploy proxy with nonce...");

    const walletAddress = await gnosisSafeProxyFactory
        .connect(deployer)
        .createProxyWithNonce.staticCall(_singleton, dataBytes, saltNonce);

    const createTransaction = await gnosisSafeProxyFactory
        .connect(deployer)
        .createProxyWithNonce(_singleton, dataBytes, saltNonce);
    await createTransaction.wait(1);

    console.log(`\nWallet address: ${walletAddress}`);

    console.log("\nSuccess");
}

deployMultisigWallet().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

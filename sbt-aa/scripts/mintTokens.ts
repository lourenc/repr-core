import hre from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

import { ethers } from "hardhat";
import { addDec } from "../test/helpers";

import addrs from "./deploymentAddressses.json";

let receiver: string, aiSigTokenAddress: string;
if (hre.network.name === "sepolia") {
    receiver = addrs.sepolia.gnosisWallet;
    aiSigTokenAddress = addrs.sepolia.aiSigToken;
} else if (hre.network.name === "polygon") {
    receiver = addrs.polygon.gnosisWallet;
    aiSigTokenAddress = addrs.polygon.aiSigToken;
}

async function mintTokens() {
    const [signer] = await ethers.getSigners();

    const aiSigToken = await ethers.getContractAt("AiSigToken", aiSigTokenAddress);

    console.log(`Minting tokens to ${receiver}...`);

    const txMint = await aiSigToken.connect(signer).mintFor(receiver, addDec(100_000));

    await txMint.wait(1);

    console.log(`\n${addDec(100_000)} tokens minted to ${receiver}`);
}

mintTokens()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

import hre from "hardhat";
import { ethers } from "hardhat";

import addrs from "./deploymentAddressses.json";

let sbtAddress: string, aiAccountAddress: string, multisigOwner: string;
if (hre.network.name === "sepolia") {
    sbtAddress = addrs.sepolia.sbt;
    aiAccountAddress = addrs.sepolia.aiAccountAddress;
    multisigOwner = addrs.sepolia.multisigOwner;
} else if (hre.network.name === "polygon") {
    sbtAddress = addrs.polygon.sbt;
    aiAccountAddress = addrs.polygon.aiAccountAddress;
    multisigOwner = addrs.polygon.multisigOwner;
}

async function mintSbtToken() {
    const [deployer] = await ethers.getSigners();

    console.log(`Getting SBT contract...`);

    const sbt = await ethers.getContractAt("SoulBoundToken", sbtAddress, deployer);

    // NFT mint on SBT
    console.log(`\nMinting NFT...`);

    const tokenId = await sbt.connect(deployer).mint.staticCall(multisigOwner, aiAccountAddress);
    const txMint = await sbt.connect(deployer).mint(multisigOwner, aiAccountAddress);
    await txMint.wait(1);

    console.log(`NFT minted with ID: ${tokenId}`);
}

mintSbtToken()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

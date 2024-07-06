import hre from "hardhat";
import { ethers } from "hardhat";

import { verify } from "./helpers";

async function deploySBT() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying SBT...");

    // SBT Deployment
    const SBT = await ethers.deployContract("SoulBoundToken", [], deployer);
    await SBT.waitForDeployment();

    // Verify SBT
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        await verify(SBT.target.toString(), []);
    }

    console.log(`\n\`SBT\` is deployed to ${SBT.target}`);
}

deploySBT()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

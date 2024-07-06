import { ethers } from "hardhat";
import { addDec } from "../test/helpers";

import { verify } from "./helpers";

// Params for deployment
const name = "AiSigToken";
const symbol = "AiSig";
const initialSupply = addDec(1_000_000);

async function main() {
    console.log(`Starting deploy...`);

    const token = await ethers.deployContract("AiSigToken", [name, symbol, initialSupply]);
    await token.waitForDeployment();

    console.log(`Token ${name} was deployed to ${token.target}`);

    console.log(`\n Verifying...`);

    await verify(token.target.toString(), [name, symbol, initialSupply]);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

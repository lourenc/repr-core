import hre from "hardhat";
import { ethers } from "hardhat";

import { verify } from "./helpers";

import addrs from "./deploymentAddressses.json";

const REGISTRY_ADDRESS = "0x000000006551c19487814612e58FE06813775758";
let tokenId: string, SBT: string;
if (hre.network.name === "sepolia") {
    tokenId = addrs.sepolia.tokenId;
    SBT = addrs.sepolia.sbt;
} else if (hre.network.name === "polygon") {
    tokenId = addrs.polygon.tokenId;
    SBT = addrs.polygon.sbt;
}

async function deployERC6551Account() {
    const [deployer] = await ethers.getSigners();

    // Deployment of ERC6551
    console.log("\nDeploying ERC6551Account...");
    const ERC6551Account = await ethers.deployContract("ERC6551Account", [], deployer);
    await ERC6551Account.waitForDeployment();

    console.log(`\`ERC6551Account\` is deployed to ${ERC6551Account.target}`);
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        await verify(ERC6551Account.target.toString(), []);
    }

    // Registry
    const registry = await ethers.getContractAt("IERC6551Registry", REGISTRY_ADDRESS);
    const salt = ethers.randomBytes(32);
    const chainId = (await ethers.provider.getNetwork()).chainId;
    const proxyAddr = await registry.createAccount.staticCall(ERC6551Account.target, salt, chainId, SBT, tokenId);
    await registry.createAccount(ERC6551Account.target, salt, chainId, SBT, tokenId);

    // Get ERC6551Account Proxy
    const erc6551AccountProxy = await ethers.getContractAt("ERC6551Account", proxyAddr);

    console.log(`\`ERC6551Account Proxy\` is deployed to ${erc6551AccountProxy.target}`);
}

deployERC6551Account().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

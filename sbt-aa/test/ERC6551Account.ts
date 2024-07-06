import type { SnapshotRestorer } from "@nomicfoundation/hardhat-network-helpers";
import { takeSnapshot } from "@nomicfoundation/hardhat-network-helpers";

import { expect } from "chai";
import { ethers } from "hardhat";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

import type { SoulBoundToken, ERC6551Account, IERC6551Registry } from "../typechain-types";

const REGISTRY_ADDRESS = "0x000000006551c19487814612e58FE06813775758";

describe("ERC6551Account", function () {
    let snapshotA: SnapshotRestorer;

    // Signers.
    let deployer: HardhatEthersSigner,
        multisigOwner: HardhatEthersSigner,
        aiUser: HardhatEthersSigner,
        invalidOwner: HardhatEthersSigner;

    let SBT: SoulBoundToken;
    let erc6551AccountImpl: ERC6551Account;
    let erc6551AccountProxy: ERC6551Account;
    let registry: IERC6551Registry;

    let tokenId: bigint;

    before(async () => {
        // Getting of signers.
        [deployer, multisigOwner, aiUser, invalidOwner] = await ethers.getSigners();

        // Deployment of the SBT
        const SoulBoundToken = await ethers.getContractFactory("SoulBoundToken", deployer);
        SBT = await SoulBoundToken.deploy();
        await SBT.waitForDeployment();

        // Mint NFT
        tokenId = await SBT.connect(multisigOwner).mint.staticCall(aiUser.address);
        await SBT.connect(multisigOwner).mint(aiUser.address);

        // Deployment of ERC6551
        const ERC6551Account = await ethers.getContractFactory("ERC6551Account", deployer);
        erc6551AccountImpl = await ERC6551Account.deploy();
        await erc6551AccountImpl.waitForDeployment();

        registry = await ethers.getContractAt("IERC6551Registry", REGISTRY_ADDRESS);
        const salt = ethers.randomBytes(32);
        const proxyAddr = await registry.createAccount.staticCall(
            erc6551AccountImpl.target,
            salt,
            (
                await ethers.provider.getNetwork()
            ).chainId,
            SBT.target,
            tokenId
        );
        await registry.createAccount(
            erc6551AccountImpl.target,
            salt,
            (
                await ethers.provider.getNetwork()
            ).chainId,
            SBT.target,
            tokenId
        );
        erc6551AccountProxy = await ethers.getContractAt("ERC6551Account", proxyAddr);

        snapshotA = await takeSnapshot();
    });

    afterEach(async () => await snapshotA.restore());

    it("Should return token info", async () => {
        const info = await erc6551AccountProxy.token();
        expect(info[0]).to.equal((await ethers.provider.getNetwork()).chainId);
        expect(info[1]).to.equal(SBT.target);
        expect(info[2]).to.equal(tokenId);
    });

    it("Should return owner", async () => {
        const owner = await erc6551AccountProxy.owner();
        expect(owner).to.equal(aiUser.address);
    });

    it("Should return magic bytes if signer is correct", async () => {
        const result = await erc6551AccountProxy.isValidSigner(aiUser.address, "0x");
        console.log(result);
    });
});

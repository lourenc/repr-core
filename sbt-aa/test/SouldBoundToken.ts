import type { SnapshotRestorer } from "@nomicfoundation/hardhat-network-helpers";
import { takeSnapshot } from "@nomicfoundation/hardhat-network-helpers";

import { expect } from "chai";
import { ethers } from "hardhat";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

import type { SoulBoundToken } from "../typechain-types";

describe("SoulBoundToken", function () {
    let snapshotA: SnapshotRestorer;

    // Signers.
    let deployer: HardhatEthersSigner,
        multisigOwner: HardhatEthersSigner,
        aiUser: HardhatEthersSigner,
        invalidOwner: HardhatEthersSigner;

    let SBT: SoulBoundToken;

    before(async () => {
        // Getting of signers.
        [deployer, multisigOwner, aiUser, invalidOwner] = await ethers.getSigners();

        // Deployment of the factory.
        const SoulBoundToken = await ethers.getContractFactory("SoulBoundToken", deployer);
        SBT = await SoulBoundToken.deploy();
        await SBT.waitForDeployment();

        snapshotA = await takeSnapshot();
    });

    afterEach(async () => await snapshotA.restore());

    it("Should mint token", async () => {
        const tokenId = await SBT.connect(multisigOwner).mint.staticCall(aiUser.address);
        await SBT.connect(multisigOwner).mint(aiUser.address);

        expect(tokenId).to.equal(0); // Check that we start from 0
        expect(await SBT.ownerOf(tokenId)).to.equal(aiUser.address);
        expect(await SBT.multisigOwner(tokenId)).to.equal(multisigOwner.address);
    });

    it("Should burn token", async () => {
        // Can't burn non-existing
        await expect(SBT.connect(multisigOwner).burn(0)).revertedWithCustomError(SBT, "ERC721NonexistentToken");

        const tokenId = await SBT.connect(multisigOwner).mint.staticCall(aiUser.address);
        await SBT.connect(multisigOwner).mint(aiUser.address);

        // Burn
        await SBT.connect(multisigOwner).burn(tokenId);
        await expect(SBT.ownerOf(tokenId)).revertedWithCustomError(SBT, "ERC721NonexistentToken");
    });

    it("Should not let invalid multisig owner burn", async () => {
        const tokenId = await SBT.connect(multisigOwner).mint.staticCall(aiUser.address);
        await SBT.connect(multisigOwner).mint(aiUser.address);

        // Burn
        await expect(SBT.connect(invalidOwner).burn(tokenId)).revertedWithCustomError(SBT, "CallerNotMultisigOwner");
        await expect(SBT.connect(aiUser).burn(tokenId)).revertedWithCustomError(SBT, "CallerNotMultisigOwner");
    });

    it("Should not let transfer tokens", async () => {
        const tokenId = await SBT.connect(multisigOwner).mint.staticCall(aiUser.address);
        await SBT.connect(multisigOwner).mint(aiUser.address);

        // Transfer
        await expect(
            SBT.connect(aiUser).transferFrom(aiUser.address, invalidOwner.address, tokenId)
        ).revertedWithCustomError(SBT, "Inaccessible");
        await expect(
            SBT.connect(aiUser)["safeTransferFrom(address,address,uint256)"](
                aiUser.address,
                invalidOwner.address,
                tokenId
            )
        ).revertedWithCustomError(SBT, "Inaccessible");
        await expect(
            SBT.connect(aiUser)["safeTransferFrom(address,address,uint256,bytes)"](
                aiUser.address,
                invalidOwner.address,
                tokenId,
                "0x1111"
            )
        ).revertedWithCustomError(SBT, "Inaccessible");
    });
});

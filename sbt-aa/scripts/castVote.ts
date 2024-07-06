import hre from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

import { ethers } from "hardhat";
import { TypedDataEncoder } from "ethers";

import addrs from "./deploymentAddressses.json";

// Environment variables
let SPACE: string, PROPOSAL: string, CHOICE: string, REASON: string, MULTISIG: string, TIMESTAMP: string;

if (hre.network.name === "sepolia") {
    SPACE = addrs.sepolia.space;
    PROPOSAL = addrs.sepolia.proposal;
    CHOICE = addrs.sepolia.choice;
    REASON = addrs.sepolia.reason;
    MULTISIG = addrs.sepolia.gnosisWallet;
    TIMESTAMP = addrs.sepolia.timestamp;
} else if (hre.network.name === "polygon") {
    SPACE = addrs.polygon.space;
    PROPOSAL = addrs.polygon.proposal;
    CHOICE = addrs.polygon.choice;
    REASON = addrs.polygon.reason;
    MULTISIG = addrs.polygon.gnosisWallet;
    TIMESTAMP = addrs.polygon.timestamp;
} 

export async function getTimestamp() {
    const latestBlock = await ethers.provider.getBlock("latest");
    return latestBlock?.timestamp;
}

export async function castVote() {

    const domain = {
        name: "snapshot",
        version: "0.1.4"
    };

    const types = {
        Vote: [
            {
                name: "from",
                type: "address"
            },
            {
                name: "space",
                type: "string"
            },
            {
                name: "timestamp",
                type: "uint64"
            },
            {
                name: "proposal",
                type: "bytes32"
            },
            {
                name: "choice",
                type: "uint32"
            },
            {
                name: "reason",
                type: "string"
            },
            {
                name: "app",
                type: "string"
            },
            {
                name: "metadata",
                type: "string"
            }
        ]
    };

    const value = {
        from: MULTISIG,
        space: SPACE,
        timestamp: TIMESTAMP,
        proposal: PROPOSAL,
        choice: CHOICE,
        reason: REASON,
        app: "snapshot",
        metadata: "{}"
    };

    console.log(
        `from: ${MULTISIG},
        space: ${SPACE},
        timestamp: ${TIMESTAMP},
        proposal: ${PROPOSAL},
        choice: ${CHOICE},
        reason: ${REASON}
        `
    );
    const hash = TypedDataEncoder.hash(domain, types, value);
    console.log("Hash: ", hash);
    return { hash };
}

castVote().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

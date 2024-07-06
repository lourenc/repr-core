import hre from "hardhat";
import { ethers } from "hardhat";

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function verify(address: string, args: any) {
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        let retry = 20;
        console.log("Sleeping before verification...");
        while ((await ethers.provider.getCode(address).catch(() => "")).length <= 3 && retry >= 0) {
            await sleep(5000);
            --retry;
        }
        await sleep(30000);

        console.log(address, args);

        await hre
            .run("verify:verify", {
                address,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                constructorArguments: args
            })
            .catch(() => console.log("Verification failed"));
    }
}

export async function getChainId() {
    return (await ethers.provider.getNetwork()).chainId;
}

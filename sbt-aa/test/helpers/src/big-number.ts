import type { BigNumberish } from "ethers";
import { ethers } from "hardhat";

const parseUnits = ethers.parseUnits;

function ntos(num: BigNumberish): string {
    return typeof num === "string" ? num : num.toString();
}

/*
 * Converts a value in units to wei.
 *
 * .ether(value): Converts a value in Ether to wei.
 *     Equal to parseUnits(val, 18), parseUnits(val, "ether").
 * .decimals(value, decimalsOrUnitName):
 *     Like value * 10 ** decimalsOrUnitName. Equal to parseUnits(val, decimalsOrUnitName).
 *     Without the `decimalsOrUnitName` argument it is equal to .ether(val).
 *     decimalsOrUnitName Number of decimals (e.g., 18, 9) or name of an ethereum unit (e.g., "ether", "gwei").
 */
const units = {
    wei: (val: BigNumberish): bigint => parseUnits(ntos(val), "wei"),
    kwei: (val: BigNumberish): bigint => parseUnits(ntos(val), "kwei"),
    mwei: (val: BigNumberish): bigint => parseUnits(ntos(val), "mwei"),
    gwei: (val: BigNumberish): bigint => parseUnits(ntos(val), "gwei"),
    szabo: (val: BigNumberish): bigint => parseUnits(ntos(val), "szabo"),
    finney: (val: BigNumberish): bigint => parseUnits(ntos(val), "finney"),
    ether: (val: BigNumberish): bigint => parseUnits(ntos(val), "ether"),
    decimals: (val: BigNumberish, decimalsOrUnitName?: BigNumberish): bigint =>
        parseUnits(ntos(val), decimalsOrUnitName)
};

// _______________ Aliases _______________

// It is equal to ethers.parseUnits(), but extended for different number types.
const addDecimals = units.decimals;

export { units, addDecimals };

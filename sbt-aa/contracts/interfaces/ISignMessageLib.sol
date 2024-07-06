// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.26;

interface ISignMessageLib {
    function signMessage(bytes calldata _message) external;
}

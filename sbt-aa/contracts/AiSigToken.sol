// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AiSigToken is ERC20 {
    constructor(string memory name, string memory symbol, uint256 _initialSupply) ERC20(name, symbol) {
        _mint(msg.sender, _initialSupply);
    }

    function mint(uint256 _amount) external {
        _mint(msg.sender, _amount);
    }

    function mintFor(address _receiver, uint256 _amount) external {
        _mint(_receiver, _amount);
    }
}
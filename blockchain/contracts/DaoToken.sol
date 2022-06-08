// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DaoToken is ERC20{
    uint256 private _totalSupply;

    constructor() ERC20("Dao utility token", "DAOUT") {
        _totalSupply = 10000;
        _mint(msg.sender, _totalSupply);
    }
}

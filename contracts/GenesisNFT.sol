// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {CAPITNftBase} from "./CAPITNftBase.sol";

contract GenesisNFT is CAPITNftBase {
    constructor(address admin) CAPITNftBase("CAPIT Genesis Archive", "CAPITG", admin) {}
}

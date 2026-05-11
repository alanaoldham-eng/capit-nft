// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {CAPITNftBase} from "./CAPITNftBase.sol";

contract RegistryNFT is CAPITNftBase {
    constructor(address admin) CAPITNftBase("CAPIT Plugged Well Registry", "CAPITR", admin) {}
}

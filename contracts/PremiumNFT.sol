// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {CAPITNftBase} from "./CAPITNftBase.sol";

contract PremiumNFT is CAPITNftBase {
    constructor(address admin) CAPITNftBase("CAPIT Premium Well Stories", "CAPITP", admin) {}
}

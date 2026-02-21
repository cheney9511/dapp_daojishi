    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.20;

    import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
    import "@openzeppelin/contracts/access/Ownable.sol";

    /**
    * @title CDTToken
    * @notice 标准 ERC20 代币，适配 BSC 主网/测试网
    * @dev 关键参数（部署前可修改）：
    *   - name: "Countdown Token"
    *   - symbol: "CDT"
    *   - decimals: 18
    *   - totalSupply: 100_000_000 * 10^18 (1 亿枚)
    */
    contract CDTToken is ERC20, Ownable {
        // ============ 关键参数（部署前可修改） ============
        uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 1 亿 CDT

        constructor() ERC20("Countdown Token", "CDT") Ownable(msg.sender) {
            _mint(msg.sender, INITIAL_SUPPLY);
        }
    }

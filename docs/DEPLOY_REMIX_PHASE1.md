# Phase 1 Remix 部署指南：CDT + GameCore（自建模式）

## 一、前置准备

1. 打开 [Remix](https://remix.ethereum.org/)
2. MetaMask 切换到 **BSC 测试网**（Chain ID 97）
3. 从 [BSC 测试网水龙头](https://testnet.bnbchain.org/faucet-smart) 领取 tBNB

---

## 二、合约文件

从 `react-app/contracts/` 复制到 Remix：

| 文件 | 路径 | 说明 |
|------|------|------|
| CDTToken.sol | `contracts/CDTToken.sol` | 代币合约，1 亿枚 |
| CountdownProtocol.sol | `contracts/CountdownProtocol.sol` | 主合约（GameCore） |

**OpenZeppelin**：Remix 通过 NPM 解析 `@openzeppelin/contracts`。若失败，可用 Import from URL 导入。

---

## 三、部署顺序

### 步骤 1：部署 CDTToken

1. Solidity Compiler：选择 `0.8.20` 或以上
2. 编译 CDTToken.sol
3. Deploy & Run → Contract 选 `CDTToken`
4. 点击 Deploy（无参数）
5. 复制 **CDT 合约地址**

### 步骤 2：部署 GameCore

1. Contract 选 `GameCore`
2. Deploy 参数：`token_` = CDT 地址
3. 点击 Deploy
4. 复制 **GameCore 合约地址**

### 步骤 3：授权

GameCore.buy() 会从 CDT owner 转出代币，需先授权：

1. 展开 **CDTToken** 合约
2. 调用 `approve(spender, amount)`：
   - `spender`：GameCore 合约地址
   - `amount`：`115792089237316195423570985008687907853269984665640564039457584007913129639935`（即 `type(uint256).max`）
3. 点击 transact

---

## 四、配置 DApp

在 `react-app/.env` 中填入：

```
VITE_USE_TESTNET=true
VITE_TOKEN_ADDRESS=0x...   # CDT 地址
VITE_PROTOCOL_ADDRESS=0x... # GameCore 地址
```

可选：若需从合约部署区块起全量拉取买卖记录，可配置 `VITE_PROTOCOL_DEPLOY_BLOCK=区块号`，否则默认扫描最近 10000 块。

重启 `pnpm dev` 后即可测试买卖。实时战况面板会通过 Bought/Sold 事件展示链上买卖记录，每 15 秒自动刷新。

# Countdown Protocol DApp

倒计时协议前端 DApp：买卖 CDT 代币、实时倒计时、奖池与开奖机制。

## 功能特性

- **买卖 CDT**：用 BNB 买入 / 卖出 CDT（1 BNB = 1000 CDT，3% 手续费进奖池）
- **动态倒计时**：买单加速、卖单延缓，归零即开奖
- **爆率机制**：每笔买单增加开奖权重，持仓 ≥ 5000 CDT 可参与
- **实时战况**：链上 Bought/Sold 事件 + 本地缓存 + 乐观更新
- **多语言**：中文 / English
- **钱包连接**：MetaMask、WalletConnect 等

## 技术栈

- React 18 + TypeScript + Vite
- Wagmi + Viem（链上交互）
- Tailwind CSS
- TanStack Query

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`，填入合约地址：

```bash
cp .env.example .env
```

```env
# 是否使用 BSC 测试网（不设或非 'false' 时为测试网）
VITE_USE_TESTNET=true

# Phase 1 自建模式：Remix 部署 CDT + GameCore 后填入
VITE_TOKEN_ADDRESS=0x...    # CDT 代币合约地址
VITE_PROTOCOL_ADDRESS=0x... # GameCore 主合约地址

# 可选：合约部署区块号，用于全量拉取买卖记录
# VITE_PROTOCOL_DEPLOY_BLOCK=12345678

# 可选：WalletConnect 项目 ID（扫码连接时必填）
# VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

### 3. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3001

### 4. 构建生产版本

```bash
pnpm build
```

产物在 `dist/` 目录。

## 合约部署

合约需先在 Remix 部署，详见 [docs/DEPLOY_REMIX_PHASE1.md](docs/DEPLOY_REMIX_PHASE1.md)。

简要步骤：

1. 部署 **CDTToken**（无参数）
2. 部署 **GameCore**（参数：CDT 地址）
3. CDT 调用 `approve(GameCore, type(uint256).max)` 授权
4. 向 GameCore 合约地址转入 BNB 作为流动性

## 项目结构

```
react-app/
├── contracts/           # Solidity 合约
│   ├── CDTToken.sol
│   └── CountdownProtocol.sol
├── src/
│   ├── abis/           # 合约 ABI
│   ├── components/     # 组件
│   │   └── Panels/     # 面板（奖池、爆率、实时战况等）
│   ├── composables/    # 逻辑复用
│   │   ├── useProtocolPublicData.ts  # 链上数据
│   │   ├── useTradeLogs.ts           # 买卖记录
│   │   └── useTradeHistoryStorage.ts # 本地存储
│   ├── config/        # 配置
│   ├── context/       # AppContext
│   ├── i18n/          # 多语言
│   ├── pages/         # 页面
│   └── styles/        # 样式
├── docs/              # 文档
└── .env.example
```

## 核心机制

| 项目 | 说明 |
|------|------|
| 汇率 | 1 BNB = 1000 CDT |
| 手续费 | 3%，全额进奖池 |
| 最小买入 | 0.001 BNB |
| 最小卖出 | 1000 CDT |
| 参与开奖 | 持仓 ≥ 5000 CDT 且本轮有买入 |
| 倒计时 | 初始 10 分钟，买单加速（60→30→15…秒），卖单 +60 秒 |
| 开奖分配 | 20% 分配（60% 大奖 + 30% 小奖 + 10% 阳光奖），80% 滚存 |

## 验证开奖

在 BscScan 合约页面：

- **Read Contract** → `roundDrawDetail(roundId)` 查看开奖详情
- **Events** → 筛选 `DrawFinished` 事件

## License

MIT

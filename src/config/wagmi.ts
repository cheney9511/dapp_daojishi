/**
 * wagmi
 * 钱包连接与 Web3 配置
 * 使用 wagmi createConfig + Web3Modal，支持 BSC/测试网、注入式/WalletConnect/Coinbase
 */

import { createConfig, createStorage, http } from 'wagmi'
import { bsc, bscTestnet } from 'wagmi/chains'
import { coinbaseWallet, walletConnect, injected } from '@wagmi/connectors'
import { createWeb3Modal } from '@web3modal/wagmi'

// WalletConnect 项目 ID（未配置时 WalletConnect 不可用，注入式钱包仍可用）
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '739fa7f28cebf658b8762dc818c0b686'

// 应用元数据（供 WalletConnect/Coinbase 展示）
const metadata = {
  name: 'COUNTDOWN Protocol',
  description: 'COUNTDOWN Protocol - 倒计时协议',
  url: typeof window !== 'undefined' ? window.location.origin : '',
  icons: typeof window !== 'undefined' ? [`${window.location.origin}/favicon.ico`] : [] as string[],
}

// 测试网优先：便于本地默认连 BSC 测试网；VITE_USE_TESTNET=false 时主网优先
const useTestnet = import.meta.env.VITE_USE_TESTNET !== 'false'
const chains = useTestnet ? ([bscTestnet, bsc] as const) : ([bsc, bscTestnet] as const)

// RPC：公共节点，与 Vue 端逻辑一致（不依赖根目录 contracts）
const BSC_TESTNET_RPC = 'https://bsc-testnet.publicnode.com'
const BSC_MAINNET_RPC = 'https://bsc-dataseed1.binance.org'

// 持久化连接状态到 localStorage，key 与 Vue 一致
const storage = createStorage({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  key: 'wagmi',
})

// 创建 wagmi 配置
export const wagmiConfig = createConfig({
  chains,
  connectors: [
    injected({ shimDisconnect: true }),
    walletConnect({
      projectId,
      metadata,
      showQrModal: false,
    }),
    coinbaseWallet({
      appName: metadata.name,
      appLogoUrl: metadata.icons[0],
    }),
  ],
  transports: {
    [bsc.id]: http(BSC_MAINNET_RPC),
    [bscTestnet.id]: http(BSC_TESTNET_RPC),
  },
  storage,
  ssr: false,
})

// Web3Modal 实例：点击「连接钱包」时打开，支持移动端
export const web3Modal = createWeb3Modal({
  wagmiConfig,
  projectId,
  enableAnalytics: false,
  enableOnramp: false,
  themeMode: 'dark',
})

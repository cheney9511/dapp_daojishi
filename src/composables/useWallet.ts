/**
 * useWallet
 * 钱包连接 Composable：连接/断开、地址、余额、链 ID，与 Vue 端 useWallet 行为一致
 */

import { useEffect, useMemo } from 'react'
import {
  useConnection,
  useBalance,
  useDisconnect,
  useConnect,
  useReconnect,
  useChainId,
  useSwitchChain,
} from 'wagmi'
import { formatUnits } from 'viem'
import { web3Modal } from '@/config/wagmi'

/** useWallet 返回值类型 */
export interface UseWalletReturn {
  address: `0x${string}` | undefined
  isConnected: boolean
  isPending: boolean
  chainId: number | undefined
  formattedAddress: string
  formattedBalance: string
  balanceSymbol: string
  connectWallet: () => void
  disconnectWallet: () => Promise<void>
  switchToChain: (chainId: number) => Promise<void>
}

/**
 * 钱包连接与状态
 * 提供连接/断开、格式化地址与余额、可选链切换；连接成功后自动关闭 Web3Modal
 * 须在 WagmiProvider 内使用
 */
export function useWallet(): UseWalletReturn {
  const { address, isConnected, connector } = useConnection()
  const { data: balance } = useBalance({
    address: address ?? undefined,
  })
  const { mutateAsync: disconnectAsync } = useDisconnect()
  const { isPending } = useConnect()
  const { mutateAsync: reconnectAsync } = useReconnect()
  const chainId = useChainId()
  const { mutateAsync: switchChainAsync } = useSwitchChain()

  // 格式化地址：前 6 位 + … + 后 4 位
  const formattedAddress = useMemo(() => {
    if (!address) return ''
    return `${address.slice(0, 6)}…${address.slice(-4)}`
  }, [address])

  // 格式化余额与单位
  const formattedBalance = useMemo(() => {
    if (!balance) return '0'
    return parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4)
  }, [balance])

  const balanceSymbol = balance?.symbol ?? 'BNB'

  // 打开 Web3Modal 选择钱包（与 Vue 一致）
  const connectWallet = () => {
    web3Modal.open()
  }

  // 先关 Web3Modal 再断开，避免默认确认弹窗
  const disconnectWallet = async () => {
    try {
      web3Modal.close()
    } catch {
      // 忽略关闭错误
    }
    await disconnectAsync()
  }

  // 切换链
  const switchToChain = async (targetChainId: number) => {
    await switchChainAsync({ chainId: targetChainId })
  }

  // 挂载时尝试恢复已保存的连接
  useEffect(() => {
    reconnectAsync().catch(() => {
      // 无已保存连接时忽略
    })
  }, [reconnectAsync])

  // 页面从后台恢复时尝试重连（如从钱包 App 返回）
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return
      setTimeout(() => {
        if (connector && !address) {
          reconnectAsync().catch(() => {})
        } else if (!isConnected) {
          reconnectAsync().catch(() => {})
        }
      }, 300)
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [connector, address, isConnected, reconnectAsync])

  // 连接成功后关闭 Web3Modal
  useEffect(() => {
    if (!isConnected) return
    const t = setTimeout(() => {
      web3Modal.close()
    }, 500)
    return () => clearTimeout(t)
  }, [isConnected])

  return {
    address,
    isConnected,
    isPending,
    chainId,
    formattedAddress,
    formattedBalance,
    balanceSymbol,
    connectWallet,
    disconnectWallet,
    switchToChain,
  }
}

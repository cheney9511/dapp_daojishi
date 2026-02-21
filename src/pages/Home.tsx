/**
 * Home
 * 首页：Header、Hero、左侧三面板、中央倒计时与买卖按钮、右侧实时战况、底部三栏、买入/卖出弹窗
 * Phase 1：对接 GameCore.buy/sell，链上数据由 ProtocolDataSync 同步
 */

import { useCallback } from 'react'
import { useAppContext } from '@/context/AppContext'
import { useWallet } from '@/composables/useWallet'
import { useWriteContract } from 'wagmi'
import { getPublicClient } from '@wagmi/core'
import { parseEther, parseUnits } from 'viem'
import { wagmiConfig } from '@/config/wagmi'
import { toastStore } from '@/components/Toast'
import Header from '@/components/Header'
import HeroSection from '@/components/HeroSection'
import CountdownCircle from '@/components/CountdownCircle'
import ActionButtons from '@/components/ActionButtons'
import TransactionModal from '@/components/TransactionModal'
import PositiveFlywheelPanel from '@/components/Panels/PositiveFlywheelPanel'
import DynamicCountdownPanel from '@/components/Panels/DynamicCountdownPanel'
import ExplosionRatePanel from '@/components/Panels/ExplosionRatePanel'
import PrizePoolPanel from '@/components/Panels/PrizePoolPanel'
import CurrentExplosionRatePanel from '@/components/Panels/CurrentExplosionRatePanel'
import SystemStatusPanel from '@/components/Panels/SystemStatusPanel'
import RealTimeBattlePanel from '@/components/Panels/RealTimeBattlePanel'
import {
  protocolContractConfig,
  tokenContractConfig,
  hasContractAddresses,
  BSC_CHAIN_ID_EXPORT,
} from '@/config/contracts'
import { useProtocolPublicData } from '@/composables/useProtocolPublicData'

/** 解析链上/钱包错误，返回用户可读的失败原因 */
function parseTxError(e: unknown, t: (k: string) => string, fallbackKey: string): string {
  const msg = e instanceof Error ? e.message : String(e)
  const lower = msg.toLowerCase()
  if (
    lower.includes('user rejected') ||
    lower.includes('user denied') ||
    lower.includes('rejected the request') ||
    lower.includes('request rejected') ||
    lower.includes('cancelled') ||
    lower.includes('canceled') ||
    lower.includes('4001') // MetaMask user rejected code
  ) {
    return t('toast.txCancelled')
  }
  if (msg && msg.trim()) return msg
  return t(fallbackKey)
}

const BSC_EXPLORER_TX =
  BSC_CHAIN_ID_EXPORT === 97 ? 'https://testnet.bscscan.com/tx/' : 'https://bscscan.com/tx/'

export default function Home(): JSX.Element {
  const { state, setState, t, addOptimisticTransaction } = useAppContext()
  const { isConnected, address, chainId } = useWallet()
  const { mutateAsync: writeContractAsync, isPending: isTxPending } = useWriteContract()
  const { refetch } = useProtocolPublicData()

  const handleBuy = () => {
    if (!isConnected) {
      toastStore.addToast({ type: 'warning', message: t('toast.connectWallet'), duration: 3000 })
      return
    }
    if (!hasContractAddresses) {
      toastStore.addToast({ type: 'warning', message: '合约未配置，无法买入', duration: 3000 })
      return
    }
    if (chainId !== BSC_CHAIN_ID_EXPORT) {
      toastStore.addToast({ type: 'warning', message: '请先切换到 BSC 测试网', duration: 3000 })
      return
    }
    setState((prev) => ({ ...prev, showBuyModal: true }))
  }

  const handleSell = () => {
    if (!isConnected) {
      toastStore.addToast({ type: 'warning', message: t('toast.connectWallet'), duration: 3000 })
      return
    }
    if (!hasContractAddresses) {
      toastStore.addToast({ type: 'warning', message: '合约未配置，无法卖出', duration: 3000 })
      return
    }
    if (chainId !== BSC_CHAIN_ID_EXPORT) {
      toastStore.addToast({ type: 'warning', message: '请先切换到 BSC 测试网', duration: 3000 })
      return
    }
    setState((prev) => ({ ...prev, showSellModal: true }))
  }

  const closeBuyModal = () => setState((prev) => ({ ...prev, showBuyModal: false }))
  const closeSellModal = () => setState((prev) => ({ ...prev, showSellModal: false }))

  const handleBuyConfirm = useCallback(
    async (amountStr: string) => {
      if (!address || !hasContractAddresses) return
      const amount = amountStr.trim()
      if (!amount || Number(amount) <= 0) {
        toastStore.addToast({ type: 'warning', message: '请输入有效金额', duration: 3000 })
        return
      }
      if (Number(amount) < 0.001) {
        toastStore.addToast({ type: 'warning', message: '最小买入 0.001 BNB', duration: 3000 })
        return
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const publicClient = getPublicClient(wagmiConfig as any, { chainId: BSC_CHAIN_ID_EXPORT })
      try {
        const valueWei = parseEther(amount)
        const hash = await writeContractAsync({
          ...protocolContractConfig,
          functionName: 'buy',
          value: valueWei,
          gas: 5_000_000n, // 显式限制 gas，避免超过链上 cap 34M
        })
        const receipt = publicClient ? await publicClient.waitForTransactionReceipt({ hash }) : null
        if (receipt?.status === 'reverted') {
          toastStore.addToast({
            type: 'error',
            title: t('toast.buyFail'),
            message: t('toast.txReverted'),
            duration: 8000,
            link: `${BSC_EXPLORER_TX}${hash}`,
          })
          return
        }
        const shortHash = `${String(hash).slice(0, 10)}...${String(hash).slice(-8)}`
        toastStore.addToast({
          type: 'success',
          title: t('toast.buySuccess'),
          message: `${t('toast.buySuccessDesc', { amount })} ${t('toast.buySuccessTx', { hash: shortHash })}`,
          duration: 6000,
          link: `${BSC_EXPLORER_TX}${hash}`,
        })
        // 使用链上区块时间戳，而非本地时间
        let blockTimestampMs = Date.now()
        if (publicClient && receipt?.blockNumber) {
          const block = await publicClient.getBlock({ blockNumber: receipt.blockNumber })
          blockTimestampMs = Number(block.timestamp) * 1000
        }
        addOptimisticTransaction({
          type: 'buy',
          amount: Number(amount),
          timestamp: blockTimestampMs,
          address,
          hash: String(hash),
        })
        closeBuyModal()
        refetch()
      } catch (e) {
        const message = parseTxError(e, t, 'toast.buyFail')
        toastStore.addToast({
          type: 'error',
          title: t('toast.buyFail'),
          message,
          duration: 8000,
        })
      }
    },
    [address, writeContractAsync, refetch, t, addOptimisticTransaction]
  )

  const handleSellConfirm = useCallback(
    async (amountStr: string) => {
      if (!address || !hasContractAddresses) return
      const amount = amountStr.trim()
      if (!amount || Number(amount) <= 0) {
        toastStore.addToast({ type: 'warning', message: '请输入有效金额', duration: 3000 })
        return
      }
      if (Number(amount) < 1000) {
        toastStore.addToast({ type: 'warning', message: '最小卖出 1000 CDT', duration: 3000 })
        return
      }
      const cdtBalance = Number(state.userBalance)
      if (cdtBalance < Number(amount)) {
        toastStore.addToast({ type: 'warning', message: 'CDT 余额不足', duration: 3000 })
        return
      }

      const decimals = 18
      const cdtWei = parseUnits(amount, decimals)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const publicClient = getPublicClient(wagmiConfig as any, { chainId: BSC_CHAIN_ID_EXPORT })

      try {
        const approveHash = await writeContractAsync({
          ...tokenContractConfig,
          functionName: 'approve',
          args: [protocolContractConfig.address, cdtWei],
          gas: 100_000n,
        })
        toastStore.addToast({ type: 'info', message: '授权已提交，等待确认…', duration: 3000 })
        const approveReceipt = publicClient ? await publicClient.waitForTransactionReceipt({ hash: approveHash }) : null
        if (approveReceipt?.status === 'reverted') {
          toastStore.addToast({
            type: 'error',
            title: t('toast.sellFail'),
            message: t('toast.txReverted'),
            duration: 8000,
            link: `${BSC_EXPLORER_TX}${approveHash}`,
          })
          return
        }

        const hash = await writeContractAsync({
          ...protocolContractConfig,
          functionName: 'sell',
          args: [cdtWei],
          gas: 5_000_000n, // 显式限制 gas，避免超过链上 cap 34M
        })
        const receipt = publicClient ? await publicClient.waitForTransactionReceipt({ hash }) : null
        if (receipt?.status === 'reverted') {
          toastStore.addToast({
            type: 'error',
            title: t('toast.sellFail'),
            message: t('toast.txReverted'),
            duration: 8000,
            link: `${BSC_EXPLORER_TX}${hash}`,
          })
          return
        }
        const shortHash = `${String(hash).slice(0, 10)}...${String(hash).slice(-8)}`
        toastStore.addToast({
          type: 'success',
          title: t('toast.sellSuccess'),
          message: `${t('toast.sellSuccessDesc', { amount })} ${t('toast.sellSuccessTx', { hash: shortHash })}`,
          duration: 6000,
          link: `${BSC_EXPLORER_TX}${hash}`,
        })
        // 使用链上区块时间戳，而非本地时间
        let blockTimestampMs = Date.now()
        if (publicClient && receipt?.blockNumber) {
          const block = await publicClient.getBlock({ blockNumber: receipt.blockNumber })
          blockTimestampMs = Number(block.timestamp) * 1000
        }
        // 卖出 1000 CDT ≈ 0.00097 BNB（扣 3% 后）
        const bnbOut = (Number(amount) * 0.001) / 1000 * 0.97
        addOptimisticTransaction({
          type: 'sell',
          amount: bnbOut,
          timestamp: blockTimestampMs,
          address,
          hash: String(hash),
        })
        closeSellModal()
        refetch()
      } catch (e) {
        const message = parseTxError(e, t, 'toast.sellFail')
        toastStore.addToast({
          type: 'error',
          title: t('toast.sellFail'),
          message,
          duration: 8000,
        })
      }
    },
    [address, writeContractAsync, refetch, state.userBalance, t, addOptimisticTransaction]
  )

  return (
    <main className="min-h-screen relative flex flex-col items-center overflow-x-hidden font-sans scroll-smooth">
      <Header />
      <div className="z-10 w-full max-w-[1400px] px-4 pt-32 pb-12 space-y-12">
        <HeroSection />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          <div className="lg:col-span-3 min-h-[400px]">
            <div className="h-full">
              <div className="h-full flex flex-col gap-4">
                <PositiveFlywheelPanel />
                <DynamicCountdownPanel />
                <ExplosionRatePanel />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col items-center justify-center space-y-8 relative py-8">
            <div className="relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[30px] md:blur-[100px] pointer-events-none" />
              <div className="relative z-10">
                <CountdownCircle />
              </div>
            </div>
            <div className="w-full relative z-10">
              <ActionButtons onBuy={handleBuy} onSell={handleSell} />
            </div>
          </div>

          <div className="lg:col-span-3 min-h-[400px]">
            <div className="h-full min-h-0">
              <RealTimeBattlePanel />
            </div>
          </div>
        </div>

        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
            <PrizePoolPanel />
            <CurrentExplosionRatePanel />
            <SystemStatusPanel />
          </div>
        </div>
      </div>

      <TransactionModal
        open={state.showBuyModal}
        onClose={closeBuyModal}
        type="buy"
        balance={state.bnbBalance}
        onConfirm={handleBuyConfirm}
        isLoading={isTxPending}
      />
      <TransactionModal
        open={state.showSellModal}
        onClose={closeSellModal}
        type="sell"
        balance={state.userBalance}
        onConfirm={handleSellConfirm}
        isLoading={isTxPending}
      />
    </main>
  )
}

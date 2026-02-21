/**
 * ProtocolDataSync
 * 当合约已配置时，将链上数据同步到 AppContext
 * 包含倒计时、奖池、爆率、用户余额、周期信息，以及买卖记录（链上 + 本地存储 + 乐观更新）
 */

import { useEffect } from 'react'
import { useAppContext } from '@/context/AppContext'
import { useProtocolPublicData } from '@/composables/useProtocolPublicData'
import { useTradeLogs } from '@/composables/useTradeLogs'
import {
  loadTradeHistoryFromStorage,
  saveTradeHistoryToStorage,
  mergeTradeHistory,
} from '@/composables/useTradeHistoryStorage'
import { hasContractAddresses } from '@/config/contracts'

const MAX_CRITICAL_SECONDS = 600

export default function ProtocolDataSync(): null {
  const { setState, optimisticTransactions, clearOptimisticByHashes } = useAppContext()
  const data = useProtocolPublicData()
  const { transactions: chainTransactions } = useTradeLogs()

  useEffect(() => {
    if (!hasContractAddresses || data.isLoading) return

    const chainData = {
      countdown: data.countdown,
      prizePoolBNB: data.prizePoolBNB,
      currentRound: data.currentRound,
      participantCount: data.participantCount,
      userRate: data.userRate,
      userBalance: data.userBalance,
    }
    console.log('[链上数据]', chainData)

    setState((prev) => ({
      ...prev,
      countdown: {
        ...prev.countdown,
        totalSeconds: data.countdown,
        isCritical: data.countdown <= MAX_CRITICAL_SECONDS,
        minutes: Math.floor(data.countdown / 60),
        seconds: data.countdown % 60,
      },
      prizePool: {
        amount: parseFloat(data.prizePoolBNB) || 0,
        currency: 'BNB',
      },
      userBalance: parseFloat(data.userBalance) || 0,
      cycleInfo: {
        ...prev.cycleInfo,
        cycleId: data.currentRound,
        participantCount: data.participantCount,
      },
      explosionRate: {
        ...prev.explosionRate,
        current: (data.userRate || 50) / 100, // userRate 50->0.5%, 500->5%，0 时默认 50(0.5%)
      },
    }))
  }, [
    hasContractAddresses,
    data.isLoading,
    data.countdown,
    data.prizePoolBNB,
    data.currentRound,
    data.participantCount,
    data.userRate,
    data.userBalance,
    setState,
  ])

  // 链上已包含的 hash，从乐观列表中清除（单独 effect，避免与 optimisticTransactions 形成循环）
  useEffect(() => {
    if (!hasContractAddresses || chainTransactions.length === 0) return
    const chainHashes = new Set(
      chainTransactions.map((t) => t.hash).filter((h): h is string => !!h)
    )
    if (chainHashes.size > 0) clearOptimisticByHashes(chainHashes)
  }, [hasContractAddresses, chainTransactions, clearOptimisticByHashes])

  // 链上 + 本地存储 + 乐观更新：合并并持久化
  useEffect(() => {
    if (!hasContractAddresses) return

    const source = chainTransactions.length > 0 ? chainTransactions : loadTradeHistoryFromStorage()
    const merged = mergeTradeHistory(source, optimisticTransactions)

    setState((prev) => ({ ...prev, transactions: merged }))

    if (chainTransactions.length > 0) {
      saveTradeHistoryToStorage(merged)
    }

    console.log('[实时战况]', '链上', chainTransactions.length, '笔，合并后', merged.length, '笔')
  }, [hasContractAddresses, chainTransactions, optimisticTransactions, setState])

  return null
}

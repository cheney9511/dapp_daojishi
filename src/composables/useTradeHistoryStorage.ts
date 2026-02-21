/**
 * useTradeHistoryStorage
 * 链上 + 本地存储：加载/保存实时战况，按合约地址+链ID 隔离
 */

import type { Transaction } from '@/context/AppContext'
import { CONTRACT_ADDRESSES, BSC_CHAIN_ID_EXPORT } from '@/config/contracts'

const STORAGE_KEY_PREFIX = 'realtimeTradeHistory'
const MAX_CACHED = 100

function getStorageKey(): string {
  const addr = CONTRACT_ADDRESSES.PROTOCOL || 'default'
  return `${STORAGE_KEY_PREFIX}_${BSC_CHAIN_ID_EXPORT}_${addr}`
}

/** 从 localStorage 加载交易记录 */
export function loadTradeHistoryFromStorage(): Transaction[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(getStorageKey())
    if (!raw) return []
    const parsed = JSON.parse(raw) as Transaction[]
    return Array.isArray(parsed) ? parsed.slice(0, MAX_CACHED) : []
  } catch {
    return []
  }
}

/** 保存交易记录到 localStorage */
export function saveTradeHistoryToStorage(txs: Transaction[]): void {
  if (typeof localStorage === 'undefined') return
  try {
    const toSave = txs.slice(0, MAX_CACHED)
    localStorage.setItem(getStorageKey(), JSON.stringify(toSave))
  } catch {
    // ignore
  }
}

/** 合并链上 + 乐观更新，按 hash 去重（链上优先），按时间倒序 */
export function mergeTradeHistory(
  chainTxs: Transaction[],
  optimisticTxs: Transaction[]
): Transaction[] {
  const chainHashes = new Set(chainTxs.map((t) => t.hash).filter(Boolean))
  const optimisticOnly = optimisticTxs.filter((t) => !t.hash || !chainHashes.has(t.hash))
  const merged = [...chainTxs, ...optimisticOnly]
  merged.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
  return merged.slice(0, MAX_CACHED)
}

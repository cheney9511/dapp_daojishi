/**
 * useTradeLogs
 * 通过 getLogs 拉取 Bought/Sold 事件，解析为 Transaction 列表
 */

import { useQuery } from '@tanstack/react-query'
import { getPublicClient } from '@wagmi/core'
import { formatEther } from 'viem'
import {
  CONTRACT_ADDRESSES,
  hasContractAddresses,
  BSC_CHAIN_ID_EXPORT,
} from '@/config/contracts'
import { wagmiConfig } from '@/config/wagmi'
import type { Transaction } from '@/context/AppContext'

const TRADE_LOGS_QUERY_KEY = ['tradeLogs', CONTRACT_ADDRESSES.PROTOCOL]
const DEFAULT_BLOCK_RANGE = 10_000
/** 最多处理笔数，避免上万笔时 getBlock 请求过多导致 RPC 限流/超时 */
const MAX_TRADE_LOGS = 150

/** 稳定空数组引用，避免 useEffect 依赖导致无限循环 */
const EMPTY_TRANSACTIONS: Transaction[] = []

async function fetchTradeLogs(): Promise<Transaction[]> {
  const publicClient = getPublicClient(wagmiConfig as Parameters<typeof getPublicClient>[0], {
    chainId: BSC_CHAIN_ID_EXPORT,
  })
  if (!publicClient || !hasContractAddresses || !CONTRACT_ADDRESSES.PROTOCOL) {
    return []
  }

  const deployBlock = import.meta.env.VITE_PROTOCOL_DEPLOY_BLOCK
  const latestBlock = await publicClient.getBlockNumber()
  const fromBlock = deployBlock
    ? BigInt(deployBlock)
    : latestBlock > BigInt(DEFAULT_BLOCK_RANGE)
      ? latestBlock - BigInt(DEFAULT_BLOCK_RANGE)
      : 0n

  const [boughtLogs, soldLogs] = await Promise.all([
    publicClient.getLogs({
      address: CONTRACT_ADDRESSES.PROTOCOL,
      event: {
        type: 'event',
        name: 'Bought',
        inputs: [
          { name: 'user', type: 'address', indexed: true },
          { name: 'bnbAmount', type: 'uint256', indexed: false },
          { name: 'cdtAmount', type: 'uint256', indexed: false },
        ],
      },
      fromBlock,
      toBlock: 'latest',
    }),
    publicClient.getLogs({
      address: CONTRACT_ADDRESSES.PROTOCOL,
      event: {
        type: 'event',
        name: 'Sold',
        inputs: [
          { name: 'user', type: 'address', indexed: true },
          { name: 'cdtAmount', type: 'uint256', indexed: false },
          { name: 'bnbAmount', type: 'uint256', indexed: false },
        ],
      },
      fromBlock,
      toBlock: 'latest',
    }),
  ])

  type RawLog = { type: 'buy' | 'sell'; user: `0x${string}`; bnbAmount: bigint; blockNumber: bigint; txHash: `0x${string}` }
  const buyRaw: RawLog[] = boughtLogs.map((l) => ({
    type: 'buy',
    user: l.args.user as `0x${string}`,
    bnbAmount: l.args.bnbAmount as bigint,
    blockNumber: l.blockNumber,
    txHash: l.transactionHash,
  }))
  const sellRaw: RawLog[] = soldLogs.map((l) => ({
    type: 'sell',
    user: l.args.user as `0x${string}`,
    bnbAmount: l.args.bnbAmount as bigint,
    blockNumber: l.blockNumber,
    txHash: l.transactionHash,
  }))

  // 先合并排序，只取最新 MAX_TRADE_LOGS 笔，避免上万笔时 getBlock 请求过多
  const mergedRaw = [...buyRaw, ...sellRaw].sort(
    (a, b) => Number(b.blockNumber) - Number(a.blockNumber)
  )
  const limitedRaw = mergedRaw.slice(0, MAX_TRADE_LOGS)

  const uniqueBlockNumbers = [...new Set(limitedRaw.map((r) => r.blockNumber))]
  const blockMap = new Map<bigint, number>()
  await Promise.all(
    uniqueBlockNumbers.map(async (bn) => {
      const b = await publicClient.getBlock({ blockNumber: bn })
      blockMap.set(bn, Number(b.timestamp) * 1000)
    })
  )

  const result: Transaction[] = limitedRaw.map((r) => ({
    type: r.type,
    amount: parseFloat(formatEther(r.bnbAmount)),
    timestamp: blockMap.get(r.blockNumber) ?? Date.now(),
    address: r.user,
    hash: r.txHash,
    blockNumber: Number(r.blockNumber),
  }))

  return result
}

export function useTradeLogs(): {
  transactions: Transaction[]
  isLoading: boolean
  isFetching: boolean
  refetch: () => void
} {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: TRADE_LOGS_QUERY_KEY,
    queryFn: fetchTradeLogs,
    enabled: hasContractAddresses && !!CONTRACT_ADDRESSES.PROTOCOL,
    refetchInterval: false, // 仅点击刷新时请求
    staleTime: 0,
  })

  const transactions = data ?? EMPTY_TRANSACTIONS
  return { transactions, isLoading, isFetching, refetch }
}

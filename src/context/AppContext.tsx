/**
 * AppContext
 * 全局应用状态管理
 * 使用 React Context + useState 管理静态数据，无链上/接口依赖
 */

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect, ReactNode } from 'react'
import { translate, type Language } from '@/i18n/translations'

/** 倒计时状态：总秒数、是否临界、分秒展示 */
export interface CountdownState {
  totalSeconds: number      // 本轮剩余总秒数
  isCritical: boolean       // 是否进入临界（红圈）状态
  minutes: number           // 展示用：分钟数
  seconds: number           // 展示用：秒数
}

/** 奖池信息：金额与币种 */
export interface PrizePool {
  amount: number            // 当前奖池金额
  currency: string          // 币种标识，如 BNB
}

/** 爆率：基础/当前/上限/买单加成 */
export interface ExplosionRate {
  base: number              // 基础爆率（%）
  current: number           // 当前累计加成（%）
  max: number               // 爆率上限（%）
  bonus: number             // 每笔买单增加的爆率（%）
}

/** 当前周期信息：轮次、参与人数、买卖单统计、是否活跃等 */
export interface CycleInfo {
  cycleId: number           // 当前轮次 ID
  participantCount: number  // 本轮参与人数
  startTime: number         // 本轮开始时间戳（ms）
  endTime: number           // 本轮结束时间戳（ms）
  lastTradeTime: number     // 最后一笔交易时间戳（ms）
  cooldownStartTime: number // 冷却开始时间戳（ms）
  consecutiveBuys: number   // 连续买单次数
  totalBuyOrders: number    // 本轮总买单数
  totalSellOrders: number   // 本轮总卖单数
  isActive: boolean         // 本轮是否在进行中
  isDrawCompleted: boolean  // 本轮是否已开奖完成
}

/** 系统状态：参与人数、轮次、是否运行中 */
export interface SystemStatus {
  participants: number      // 当前参与人数
  round: number             // 当前轮次
  isRunning: boolean        // 系统是否运行中
}

/** 单笔交易记录：买卖类型、金额、时间、地址，可选 hash/区块号 */
export interface Transaction {
  type: 'buy' | 'sell'      // 买卖类型
  amount: number            // 交易金额
  timestamp: number         // 交易时间戳（ms）
  address: string           // 交易方地址
  hash?: string             // 可选：链上交易 hash
  blockNumber?: number      // 可选：区块号
}

/** 应用全局状态：语言、倒计时、奖池、爆率、用户余额、周期、弹窗与交易列表 */
export interface AppState {
  lang: Language            // 当前界面语言 zh / en
  countdown: CountdownState // 中央倒计时状态
  prizePool: PrizePool      // 奖池金额与币种
  explosionRate: ExplosionRate // 爆率基础/当前/上限/加成
  userBalance: number       // 用户代币余额（演示用）
  bnbBalance: string        // 用户 BNB 余额（展示用字符串）
  cycleInfo: CycleInfo      // 当前周期/轮次信息
  showBuyModal: boolean     // 是否显示买入弹窗
  showSellModal: boolean    // 是否显示卖出弹窗
  transactions: Transaction[] // 实时战况交易列表
}

/** Context 暴露：state、setState、多语言 t、切换语言 setLanguage、乐观更新 */
export interface AppContextType {
  state: AppState           // 当前全局状态
  setState: React.Dispatch<React.SetStateAction<AppState>> // 更新状态的 setter
  t: (key: string, params?: Record<string, string>) => string // 多语言翻译函数
  setLanguage: (lang: Language) => void // 切换语言
  optimisticTransactions: Transaction[] // 乐观更新交易（待链上确认）
  addOptimisticTransaction: (tx: Transaction) => void // 用户交易成功后添加
  clearOptimisticByHashes: (hashes: Set<string>) => void // 链上已包含时批量清除
}

// 初始倒计时：8 分钟
const initialCountdown: CountdownState = {
  totalSeconds: 0,  // 8 * 60，本轮剩余秒数
  isCritical: false,   // 未进入临界
  minutes: 8,          // 展示 8 分
  seconds: 0,          // 展示 0 秒
}

// 从 localStorage 恢复语言，仅 zh/en 有效
const savedLang = (typeof localStorage !== 'undefined' && (localStorage.getItem('language') as Language)) || 'zh'
const initialLang: Language = savedLang === 'en' || savedLang === 'zh' ? savedLang : 'zh'

// 静态 mock 数据，供全站展示
const mockData: AppState = {
  lang: initialLang,       // 从 localStorage 恢复或默认 zh
  countdown: initialCountdown, // 8 分钟倒计时初始值
  prizePool: {
    amount: 1.2345,       // 奖池金额（BNB）
    currency: 'BNB',      // 币种
  },
  explosionRate: {
    base: 0.5,            // 基础爆率 0.5%（合约 BASE_RATE 50）
    current: 0.5,         // 当前爆率，链上 userRate/100，0 时默认 0.5%
    max: 5,               // 上限 5%（合约 MAX_RATE 500）
    bonus: 0.2,           // 每笔买单 +0.2%（合约 BUY_BOOST 20）
  },
  userBalance: 50000,     // 用户代币余额（演示）
  bnbBalance: '0.5',      // 用户 BNB 余额展示
  cycleInfo: {
    cycleId: 12,          // 第 12 轮
    participantCount: 128, // 128 人参与
    startTime: 0,         // 未用，占位
    endTime: 0,           // 未用，占位
    lastTradeTime: 0,     // 未用，占位
    cooldownStartTime: 0, // 未用，占位
    consecutiveBuys: 0,   // 未用，占位
    totalBuyOrders: 0,    // 未用，占位
    totalSellOrders: 0,   // 未用，占位
    isActive: true,       // 本轮进行中
    isDrawCompleted: false, // 未开奖
  },
  showBuyModal: false,    // 初始不显示买入弹窗
  showSellModal: false,   // 初始不显示卖出弹窗
  transactions: [
    { type: 'buy', amount: 0.05, timestamp: Date.now() - 60000, address: '0x1234567890abcdef1234567890abcdef12345678' },  // 1 分钟前买入
    { type: 'sell', amount: 0.02, timestamp: Date.now() - 120000, address: '0xabcdef1234567890abcdef1234567890abcdef12' }, // 2 分钟前卖出
  ],
}

const AppContext = createContext<AppContextType | null>(null)

/**
 * 应用根 Provider
 * 提供 state/setState、多语言 t、setLanguage、乐观更新，并同步语言到 localStorage
 */
export function AppProvider({ children }: { children: ReactNode }): JSX.Element {
  const [state, setState] = useState<AppState>(mockData)
  const [optimisticTransactions, setOptimisticTransactions] = useState<Transaction[]>([])

  const t = useCallback(
    (key: string, params?: Record<string, string>) => translate(state.lang, key, params),
    [state.lang]
  )
  const setLanguage = useCallback((lang: Language) => {
    setState((prev) => ({ ...prev, lang }))
    if (typeof localStorage !== 'undefined') localStorage.setItem('language', lang)
  }, [])

  const addOptimisticTransaction = useCallback((tx: Transaction) => {
    setOptimisticTransactions((prev) => [tx, ...prev].slice(0, 20))
  }, [])
  const clearOptimisticByHashes = useCallback((hashes: Set<string>) => {
    if (hashes.size === 0) return
    setOptimisticTransactions((prev) => prev.filter((t) => !t.hash || !hashes.has(t.hash)))
  }, [])

  useEffect(() => {
    if (typeof localStorage !== 'undefined') localStorage.setItem('language', state.lang)
  }, [state.lang])

  const value = useMemo(
    () => ({
      state,
      setState,
      t,
      setLanguage,
      optimisticTransactions,
      addOptimisticTransaction,
      clearOptimisticByHashes,
    }),
    [state, t, setLanguage, optimisticTransactions, addOptimisticTransaction, clearOptimisticByHashes]
  )
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

/** 获取全局 Context，必须在 AppProvider 内使用 */
export function useAppContext(): AppContextType {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}

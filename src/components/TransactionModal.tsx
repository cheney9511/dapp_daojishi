/**
 * TransactionModal
 * 买入/卖出弹窗：金额输入、快捷金额、MAX、校验（最小 BNB/CDT、不超过余额），确认仅回调无链上
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useAppContext } from '@/context/AppContext'
import { useWallet } from '@/composables/useWallet'
import Modal from './Modal'

/** 弹窗由父组件控制显隐与余额，确认时回传输入金额字符串 */
interface TransactionModalProps {
  open: boolean
  onClose: () => void
  type: 'buy' | 'sell'
  balance: string | number
  onConfirm: (amount: string) => void
  isLoading?: boolean
}

const MIN_BUY_BNB = 0.001
const MIN_SELL_CDT = 1000

export default function TransactionModal({
  open,
  onClose,
  type,
  balance,
  onConfirm,
  isLoading = false,
}: TransactionModalProps): JSX.Element {
  const { t } = useAppContext()
  const { formattedBalance: walletBnbBalance } = useWallet()
  const [inputAmount, setInputAmount] = useState('')

  // 显示余额：买入用钱包 BNB（读取到的），卖出用父组件传入的 CDT；无法解析时默认为 0
  const displayBalance = useMemo(() => {
    if (type === 'buy') {
      const n = parseFloat(walletBnbBalance)
      return Number.isFinite(n) ? n : 0
    }
    const b = balance
    if (b === undefined || b === null) return 0
    const n = typeof b === 'string' ? parseFloat(b) : Number(b)
    return Number.isFinite(n) ? n : 0
  }, [type, balance, walletBnbBalance])

  // 快捷金额：买入 BNB 档位，卖出 CDT 档位
  const quickAmounts = type === 'buy' ? [0.001, 0.01, 0.05, 0.1, 0.5] : [1000, 5000, 10000, 50000]

  const formatQuickAmount = (amount: number) =>
    type === 'buy' ? amount.toString() : amount.toLocaleString()

  // 是否可点击确认：非空、数字、满足最小额、不超过余额
  const isValidAmount = useMemo(() => {
    if (!inputAmount || inputAmount === '') return false
    const amount = Number(inputAmount)
    if (isNaN(amount) || amount <= 0) return false
    if (type === 'buy' && amount < MIN_BUY_BNB) return false
    if (type === 'sell' && amount < MIN_SELL_CDT) return false
    if (displayBalance <= 0) return false
    return amount <= displayBalance
  }, [inputAmount, type, displayBalance])

  const setMaxAmount = () => setInputAmount(displayBalance.toString())
  const setQuickAmount = (amount: number) => setInputAmount(amount.toString())

  // 仅允许数字、小数点、退格、方向键、Ctrl+A/C/V/X/Z
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const key = e.key
    const allowed = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Tab', 'Enter', 'Home', 'End', 'Escape',
    ]
    if (e.ctrlKey || e.metaKey) {
      if (['a', 'c', 'v', 'x', 'z'].includes(key.toLowerCase())) return
    }
    if (allowed.includes(key) || /[\d.]/.test(key)) return
    e.preventDefault()
  }

  // 粘贴时过滤非数字和小数点，只保留一个小数点，小数位最多 18 位
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    let value = (e.clipboardData?.getData('text') || '').replace(/[^\d.]/g, '')
    if (value.startsWith('.')) value = '0' + value
    const firstDot = value.indexOf('.')
    if (firstDot !== -1) {
      const before = value.substring(0, firstDot + 1)
      const after = value.substring(firstDot + 1).replace(/\./g, '')
      value = before + after
    }
    const parts = value.split('.')
    if (parts.length === 2 && parts[1].length > 18) value = parts[0] + '.' + parts[1].slice(0, 18)
    setInputAmount(value)
  }

  // 输入时同粘贴规则：仅数字与一个小数点，小数位 ≤18
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d.]/g, '')
    if (value.startsWith('.')) value = '0' + value
    const firstDot = value.indexOf('.')
    if (firstDot !== -1) {
      value = value.substring(0, firstDot + 1) + value.substring(firstDot + 1).replace(/\./g, '')
    }
    const parts = value.split('.')
    if (parts.length === 2 && parts[1].length > 18) value = parts[0] + '.' + parts[1].slice(0, 18)
    setInputAmount(value)
  }

  // 确认：校验通过则回传金额并交由父组件处理（本组件不发起链上）
  const handleConfirm = useCallback(() => {
    if (!isValidAmount || isLoading) return
    onConfirm(inputAmount || '0')
  }, [isValidAmount, inputAmount, onConfirm, isLoading])

  // 关闭时清空输入，便于下次打开为空白
  const handleClose = useCallback(() => {
    setInputAmount('')
    onClose()
  }, [onClose])

  // 弹窗关闭时重置输入
  useEffect(() => {
    if (!open) setInputAmount('')
  }, [open])

  const header = (
    <div className="flex items-center gap-2 sm:gap-3">
      <div
        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          type === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
        }`}
      >
        {type === 'buy' ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m5 12 7-7 7 7" />
            <path d="M12 19V5" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14" />
            <path d="m19 12-7 7-7-7" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-xl sm:text-2xl font-black text-white">
          {type === 'buy' ? t('transaction.buy') : t('transaction.sell')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5 sm:mt-1">
          {type === 'buy' ? t('transaction.buyDesc') : t('transaction.sellDesc')}
        </p>
      </div>
    </div>
  )

  const footer = (
    <>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={!isValidAmount || isLoading}
        className={`w-full min-h-[48px] px-6 py-4 rounded-2xl text-lg font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation flex items-center justify-center gap-2 ${
          type === 'buy'
            ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]'
            : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]'
        }`}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>{t('transaction.confirming')}</span>
          </>
        ) : (
          type === 'buy' ? t('transaction.confirmBuy') : t('transaction.confirmSell')
        )}
      </button>
    </>
  )

  return (
    <Modal open={open} onClose={handleClose} size="md" closeOnBackdrop={!isLoading} header={header} footer={footer}>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">{t('transaction.amount')}</label>
            <span className="text-xs sm:text-sm text-slate-400 truncate ml-2">
              {t('transaction.balance')}: {displayBalance} {type === 'buy' ? 'BNB' : 'CDT'}
            </span>
          </div>
          <div className="relative">
            <input
              value={inputAmount}
              type="text"
              inputMode="decimal"
              placeholder="0"
              autoComplete="off"
              className="w-full px-4 py-3 pr-24 rounded-xl bg-slate-800/50 border border-white/10 text-white text-base font-semibold focus:outline-none focus:border-cyan-500/50 transition-colors"
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                type="button"
                onClick={setMaxAmount}
                className="min-w-[44px] min-h-[44px] px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold hover:bg-cyan-500/20"
              >
                MAX
              </button>
              <span className="text-slate-400 text-sm font-medium hidden sm:inline">
                {type === 'buy' ? 'BNB' : 'CDT'}
              </span>
            </div>
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            {type === 'buy' ? t('validation.buyMinHint') : t('validation.sellMinHint')}
          </p>
          <div className="flex gap-2 mt-3">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setQuickAmount(amount)}
                className="flex-1 min-h-[44px] px-3 py-2.5 rounded-lg bg-slate-800/50 border border-white/10 text-slate-300 text-sm font-medium hover:border-cyan-500/30 hover:text-white"
              >
                {formatQuickAmount(amount)}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/30 border border-white/10">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">{t('transaction.effects')}</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{t('transaction.countdown')}</span>
              <span className={`text-sm font-semibold ${type === 'buy' ? 'text-red-400' : 'text-emerald-400'}`}>
                {type === 'buy' ? '-' : '+'}1 {t('transaction.minute')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{t('transaction.explosionRate')}</span>
              <span className="text-sm font-semibold text-orange-400">
                {type === 'buy' ? '+0.2%' : t('transaction.reset')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{t('transaction.fee')}</span>
              <span className="text-sm font-semibold">
                <span className="text-cyan-400">3%</span>
                <span className="text-slate-500 mx-1">→</span>
                <span className="text-emerald-400">{t('transaction.prizePool')}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

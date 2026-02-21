/**
 * RealTimeBattlePanel
 * 右侧面板：实时战况列表，展示 Context 中的静态交易记录（买卖类型、地址缩写、金额、时间）
 * 点击刷新按钮手动拉取链上数据
 */

import { useAppContext } from '@/context/AppContext'
import { useTradeLogs } from '@/composables/useTradeLogs'

/** 时间戳转本地化时间字符串 */
function formatTime(timestamp: number, lang: string): string {
  const date = new Date(timestamp)
  const locale = lang === 'zh' ? 'zh-CN' : 'en-US'
  return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function RealTimeBattlePanel(): JSX.Element {
  const { state, t } = useAppContext()
  const { refetch, isFetching } = useTradeLogs()
  const transactions = state.transactions

  return (
    <div
      className="glass-card rounded-2xl p-6 overflow-hidden transition-colors duration-300 h-full flex flex-col relative border-r-2 border-r-cyan-500"
      style={{ opacity: 1, transform: 'none' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10 flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="text-cyan-400 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              {t('panel.realTimeBattle')}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={t('panel.refresh')}
          >
            {isFetching ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            {t('panel.refresh')}
          </button>
        </div>
        <div className="flex flex-col min-h-[320px]">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[280px] text-center space-y-3 py-6">
              <div className="w-3 h-3 rounded-full bg-cyan-400/30 animate-pulse" />
              <p className="text-xs text-slate-500">{t('panel.waitingTransactions')}</p>
              <p className="text-[10px] text-slate-600">{t('panel.transactionHint')}</p>
            </div>
          ) : (
            <div
              className="overflow-y-auto overflow-x-hidden custom-scrollbar pr-1 space-y-3"
              style={{ minHeight: 280, maxHeight: '30vh', height: '30vh' }}
            >
              {transactions.map((tx, index) => (
                <div
                  key={tx.hash || `tx-${tx.timestamp}-${tx.address}-${tx.type}-${index}`}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        tx.type === 'buy' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                      }`}
                    >
                      {tx.type === 'buy' ? (
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white">
                        {tx.type === 'buy' ? t('panel.buy') : t('panel.sell')}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {tx.address.slice(0, 6)}...{tx.address.slice(-4)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-bold ${tx.type === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.amount.toFixed(4)} BNB
                    </div>
                    <div className="text-[10px] text-slate-500">{formatTime(tx.timestamp, state.lang)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

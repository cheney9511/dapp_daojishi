/**
 * PrizePoolPanel
 * 底部三栏之一：当前奖池金额（来自 Context 静态数据）+ 税费说明
 */

import { useAppContext } from '@/context/AppContext'

export default function PrizePoolPanel(): JSX.Element {
  const { state, t } = useAppContext()
  const formattedAmount = Number(state.prizePool.amount).toFixed(4)

  return (
    <div
      className="glass-card rounded-2xl p-6 transition-colors duration-300 relative group overflow-hidden border-cyan-500/10"
      style={{ opacity: 1, transform: 'none' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="lucide lucide-trophy"
          >
            <path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978" />
            <path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978" />
            <path d="M18 9h1.5a1 1 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z" />
            <path d="M6 9H4.5a1 1 0 0 1 0-5H6" />
          </svg>
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="lucide lucide-trophy">
                <path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978" />
                <path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978" />
                <path d="M18 9h1.5a1 1 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z" />
                <path d="M6 9H4.5a1 1 0 0 1 0-5H6" />
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-400 uppercase tracking-widest">{t('panel.currentPrizePool')}</span>
          </div>
          <div className="space-y-1">
            <div className="text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200">
              {formattedAmount}
            </div>
            <div className="text-xs text-cyan-500/50 font-mono">{t('panel.prizePoolTax')}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

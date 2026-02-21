/**
 * CurrentExplosionRatePanel
 * 底部三栏之一：当前爆率数值 + BASE/MAX 进度条（与 ExplosionRatePanel 数据源一致）
 */

import { useAppContext } from '@/context/AppContext'

export default function CurrentExplosionRatePanel(): JSX.Element {
  const { state, t } = useAppContext()
  const { explosionRate } = state
  // 链上 userRate 直接转百分比：50->0.5%, 500->5%，0 时默认 0.5%
  const displayRate = explosionRate.current ?? 0.5
  const maxRate = explosionRate.max ?? 5
  const barWidthPercent = maxRate ? Math.min(100, (displayRate / maxRate) * 100) : 0

  return (
    <div className="glass-card rounded-2xl p-6 transition-colors duration-300 relative group overflow-hidden border-purple-500/10">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="lucide lucide-activity">
            <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
          </svg>
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="lucide lucide-trending-up">
                  <path d="M16 7h6v6" />
                  <path d="m22 7-8.5 8.5-5-5L2 17" />
                </svg>
              </div>
              <span className="text-sm font-medium text-slate-400 uppercase tracking-widest">{t('panel.currentRate')}</span>
            </div>
            <span className="text-2xl font-bold text-white text-glow-purple">{displayRate}%</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] uppercase text-slate-500 font-bold tracking-wider">
              <span>{t('panel.base')} {explosionRate.base}%</span>
              <span>{t('panel.max')} {explosionRate.max}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-pink-500 relative transition-all duration-1000"
                style={{ width: `${barWidthPercent}%` }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-white/50 shadow-[0_0_10px_white]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

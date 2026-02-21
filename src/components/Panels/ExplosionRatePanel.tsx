/**
 * ExplosionRatePanel
 * 左侧面板：爆率机制说明，展示基础/上限/当前进度与买单加成
 */

import { useAppContext } from '@/context/AppContext'

export default function ExplosionRatePanel(): JSX.Element {
  const { state, t } = useAppContext()
  const { explosionRate } = state
  // 链上 userRate 直接转百分比：50->0.5%, 500->5%，0 时默认 0.5%
  const displayRate = explosionRate.current ?? 0.5
  const maxRate = explosionRate.max ?? 5
  const barWidthPercent = maxRate ? Math.min(100, (displayRate / maxRate) * 100) : 0

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden transition-colors duration-300 flex-1 border-l-2 border-l-purple-500 flex flex-col justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-purple-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="lucide lucide-zap"
            >
              <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
            </svg>
            <h3 className="font-bold uppercase tracking-wider text-xs">{t('panel.explosionRate')}</h3>
          </div>
          <span className="text-xl font-bold text-white text-glow-purple">{displayRate}%</span>
        </div>
        <div className="space-y-1 mb-2">
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>{t('panel.baseRate')} {explosionRate.base}%</span>
            <span>{t('panel.dailyLimit')} {explosionRate.max}%</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-1000"
              style={{ width: `${barWidthPercent}%` }}
            />
          </div>
        </div>
        <div className="text-[10px] text-slate-500 text-right">
          {t('panel.buyBonus')} <span className="text-purple-400">+{explosionRate.bonus}%</span>
        </div>
      </div>
    </div>
  )
}
